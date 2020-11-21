import Constants from './constants';
import DropboxProvider from './dropbox/dropbox-provider';
import Log from './log';
import QueryString from './utils/query-string';
import { StorageService } from './service';

const remote = new DropboxProvider();
remote.init({ clientId: Constants.APP_ID, authUrl: Constants.HOST_URL });
const log = Log.get('RemoteProvider');

/**
 * Attempts to connect and if not forces authentication
 * @param {Window} window
 * @returns {Promise.<boolean>} Promise<boolean>
 */
export async function connect(window) {
  // Try local storage first
  let accessToken = await StorageService.settings.get('accessToken');
  if (accessToken && accessToken.refresh_token) {
    remote.client.auth.setRefreshToken(accessToken.refresh_token);
  }

  if (await remote.connect()) {
    log.debug('Connected using stored access token');
    log.info(`Logged in as ${remote.accountName} (${remote.accountEmail})`);
    return true;
  }

  if (window === undefined) {
    log.error('window parameter must be specified');
    throw new Error('window parameter must be specified');
  }

  // If that didn't work, see if there's a code
  const code = QueryString.parse(window.location.search).code;
  if (code) {
    const challenge = await StorageService.settings.get('challenge');
    const verifier = await StorageService.settings.get('verifier');
    accessToken = await remote.authenticationToken(challenge, verifier, code);
    if (await remote.connect()) {
      log.debug('Connected using url access token');
      log.info(`Logged in as ${remote.accountName} (${remote.accountEmail})`);
      await StorageService.settings.set('accessToken', accessToken);
      await StorageService.settings.delete('challenge');
      await StorageService.settings.delete('verifier');
      return true;
    }
  }

  // Initiate sign in
  const uri = remote.authenticationUrl();
  await StorageService.settings.set('challenge', remote.client.auth.codeChallenge);
  await StorageService.settings.set('verifier', remote.client.auth.codeVerifier);
  window.location.href = uri;
  return false;
}

export default remote;

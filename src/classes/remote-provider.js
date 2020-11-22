import Constants from './constants';
import DropboxProvider from './dropbox/dropbox-provider';
import Log from './log';
import QueryString from './utils/query-string';
import { StorageService } from './service';

const remote = new DropboxProvider({
  clientId: Constants.APP_ID,
  authUrl: Constants.HOST_URL });

const log = Log.get('RemoteProvider');

/**
 * Attempts to connect
 * @returns {Promise.<boolean>} Promise<boolean>
 */
export async function connectUsingStoredToken() {
  const accessToken = await StorageService.settings.get('accessToken');
  if (accessToken && accessToken.refresh_token) {
    remote.client.auth.setRefreshToken(accessToken.refresh_token);
    if (await remote.connect()) {
      log.debug('Connected using stored access token');
      log.info(`Logged in as ${remote.accountName} (${remote.accountEmail})`);
      return true;
    }
  }

  return false;
}

/**
 * Attempts to connect
 * @param {string} queryString
 * @returns {Promise.<boolean>} Promise<boolean>
 */
export async function connectUsingUrlCode(queryString) {
  const code = QueryString.parse(queryString).code;
  if (code) {
    const challenge = await StorageService.settings.get('challenge');
    const verifier = await StorageService.settings.get('verifier');
    const accessToken = await remote.authenticationToken(challenge, verifier, code);
    if (accessToken && await remote.connect()) {
      log.debug('Connected using url access token');
      log.info(`Logged in as ${remote.accountName} (${remote.accountEmail})`);
      await StorageService.settings.set('accessToken', accessToken);
      await StorageService.settings.delete('challenge');
      await StorageService.settings.delete('verifier');
      return true;
    }
  }

  return false;
}

/**
 * Forces authentication
 * @param {Window} window
 * @returns {Promise.<boolean>} Promise<boolean>
 */
export async function forceAuthentication(window) {
  if (window === undefined) {
    log.error('window parameter must be specified');
    throw new Error('window parameter must be specified');
  }

  // Initiate sign in
  const uri = remote.authenticationUrl();
  await StorageService.settings.set('challenge', remote.client.auth.codeChallenge);
  await StorageService.settings.set('verifier', remote.client.auth.codeVerifier);
  window.location.href = uri;
  return false;
}

export default remote;

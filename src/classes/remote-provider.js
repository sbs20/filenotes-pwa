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
  const oauthToken = await StorageService.settings.get('oauth');
  if (oauthToken && oauthToken.refresh_token) {
    remote.refreshToken = oauthToken.refresh_token;
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
    /** @type {PkceParameters} */
    const pkceParams = await StorageService.settings.get('pkce');
    pkceParams.code = code;
    const oauthToken = await remote.pkceFinish(pkceParams);
    if (oauthToken && await remote.connect()) {
      log.debug('Connected using url access token');
      log.info(`Logged in as ${remote.accountName} (${remote.accountEmail})`);
      await StorageService.settings.set('oauth', oauthToken);
      await StorageService.settings.delete('pkce');
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
  await StorageService.settings.delete('oauth');
  const params = remote.pkceStart();
  await StorageService.settings.set('pkce', params);
  window.location.href = params.url;
  return false;
}

export default remote;

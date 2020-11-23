import Constants from '../classes/constants';
import DropboxProvider from '../classes/dropbox-provider';
import QueryString from '../classes/utils/query-string';
import Log from './log';
import StorageService from './storage';

const remote = new DropboxProvider({
  clientId: Constants.APP_ID,
  authUrl: Constants.HOST_URL });

const log = Log.get('RemoteProvider');

/** @type {DropboxProvider} */
const methods = {};

/**
 * Attempts to connect
 * @returns {Promise.<boolean>} Promise<boolean>
 */
methods.startFromToken = async function () {
  const oauthToken = await StorageService.settings.get('oauth');
  if (oauthToken && oauthToken.refresh_token) {
    this.refreshToken = oauthToken.refresh_token;
    if (await this.connect()) {
      log.debug('Connected using stored access token');
      log.info(`Logged in as ${this.accountName} (${this.accountEmail})`);
      return true;
    }
  }

  return false;
};

/**
 * Attempts to connect
 * @param {string} queryString
 * @returns {Promise.<boolean>} Promise<boolean>
 */
methods.startFromQueryString = async function (queryString) {
  const code = QueryString.parse(queryString).code;
  if (code) {
    /** @type {PkceParameters} */
    const pkceParams = await StorageService.settings.get('pkce');
    pkceParams.code = code;
    const oauthToken = await this.pkceFinish(pkceParams);
    if (oauthToken && await this.connect()) {
      log.debug('Connected using url access token');
      log.info(`Logged in as ${this.accountName} (${this.accountEmail})`);
      await StorageService.settings.set('oauth', oauthToken);
      await StorageService.settings.delete('pkce');
      return true;
    }
  }

  return false;
};

/**
 * Forces authentication
 * @param {Window} window
 * @returns {Promise.<boolean>} Promise<boolean>
 */
methods.startAuthentication = async function (window) {
  if (window === undefined) {
    log.error('window parameter must be specified');
    throw new Error('window parameter must be specified');
  }

  // Initiate sign in
  await StorageService.settings.delete('oauth');
  const params = this.pkceStart();
  await StorageService.settings.set('pkce', params);
  window.location.href = params.url;
  return false;
};

/**
 * Start
 * @param {Window} window
 * @returns {Promise.<boolean>} Promise<boolean>
 */
methods.start = async function (window) {
  if (await this.startFromToken()) {
    return true;
  }
  if (await this.startFromQueryString(window.location.search)) {
    return true;
  }
  this.startAuthentication(window);
};

Object.assign(remote, methods);

export default remote;

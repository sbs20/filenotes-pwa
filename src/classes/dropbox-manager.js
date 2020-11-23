import Constants from './constants';
import DropboxProvider from './dropbox-provider';
import QueryString from './utils/query-string';
import Log from '../services/log';
import StorageService from '../services/storage';

const log = Log.get('DropboxManager');

export default class DropboxManager extends DropboxProvider {
  constructor() {
    super({
      clientId: Constants.APP_ID,
      authUrl: Constants.HOST_URL });
  }

  /**
   * Attempts to connect
   * @returns {Promise.<boolean>} Promise<boolean>
   */
  async startFromToken() {
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
  }

  /**
   * Attempts to connect
   * @param {string} queryString
   * @returns {Promise.<boolean>} Promise<boolean>
   */
  async startFromQueryString(queryString) {
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
  }

  /**
   * Forces authentication
   * @param {Window} window
   * @returns {Promise.<boolean>} Promise<boolean>
   */
  async startAuthentication(window) {
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
  }

  /**
   * Start
   * @param {Window} window
   * @returns {Promise.<boolean>} Promise<boolean>
   */
  async start(window) {
    if (await this.startFromToken()) {
      return true;
    }
    if (await this.startFromQueryString(window.location.search)) {
      return true;
    }
    this.startAuthentication(window);
  }
}

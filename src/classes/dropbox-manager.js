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
   * Indicates if we've connected in the past on the basis of settings
   * @returns {Promise.<boolean>}
   */
  async hasConnected() {
    const oauth = await StorageService.settings.get(Constants.Settings.OAuth);
    const name = await StorageService.settings.get(Constants.Settings.Name);
    const email = await StorageService.settings.get(Constants.Settings.Email);
    return oauth && name && email;
  }

  /**
   * Clears all authentication data from settings
   */
  async clear() {
    await StorageService.settings.delete(Constants.Settings.Pkce);
    await StorageService.settings.delete(Constants.Settings.OAuth);
    await StorageService.settings.delete(Constants.Settings.Name);
    await StorageService.settings.delete(Constants.Settings.Email);
  }

  /**
   * Attempts to connect
   * @returns {Promise.<boolean>} Promise<boolean>
   */
  async startFromToken() {
    const oauthToken = await StorageService.settings.get(Constants.Settings.OAuth);
    if (oauthToken && oauthToken.refresh_token) {
      this.refreshToken = oauthToken.refresh_token;
      if (await this.connect()) {
        log.debug('Connected using stored access token');
        log.info(`Logged in as ${this.accountName} (${this.accountEmail})`);
        await StorageService.settings.set(Constants.Settings.Name, this.accountName);
        await StorageService.settings.set(Constants.Settings.Email, this.accountEmail);
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
      const pkceParams = await StorageService.settings.get(Constants.Settings.Pkce);
      if (pkceParams) {
        pkceParams.code = code;
        const oauthToken = await this.pkceFinish(pkceParams);
        if (oauthToken && await this.connect()) {
          log.debug('Connected using url access token');
          log.info(`Logged in as ${this.accountName} (${this.accountEmail})`);
          await StorageService.settings.set(Constants.Settings.OAuth, oauthToken);
          await StorageService.settings.set(Constants.Settings.Name, this.accountName);
          await StorageService.settings.set(Constants.Settings.Email, this.accountEmail);
          await StorageService.settings.delete(Constants.Settings.Pkce);
          return true;
        }  
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
    await this.clear();
    const params = this.pkceStart();
    await StorageService.settings.set(Constants.Settings.Pkce, params);
    window.location.href = params.url;
    return false;
  }

  /**
   * Start
   * @param {Window} window
   * @returns {Promise.<boolean>} Promise<boolean>
   */
  async start(window, force) {
    if (!await this.hasConnected() || force) {
      if (await this.startFromToken()) {
        return true;
      }
      if (await this.startFromQueryString(window.location.search)) {
        return true;
      }
      this.startAuthentication(window);
    } else {
      this.cursor = await StorageService.settings.get(Constants.Settings.Cursor);
      this.accountName = await StorageService.settings.get(Constants.Settings.Name);
      this.accountEmail = await StorageService.settings.get(Constants.Settings.Email);
      const oauthToken = await StorageService.settings.get(Constants.Settings.OAuth);
      if (oauthToken && oauthToken.refresh_token) {
        this.refreshToken = oauthToken.refresh_token;
      }
      log.info(`Logged in as ${this.accountName} (${this.accountEmail}) (cached)`);
      return true;
    }
  }
}

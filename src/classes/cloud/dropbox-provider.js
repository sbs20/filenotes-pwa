import Constants from '../constants';
import DropboxClient from './dropbox-client';
import Logger from '../logger';
import QueryString from '../utils/query-string';
import Settings from '../settings';

const settings = Settings.instance();
const log = Logger.get('DropboxManager');

export default class DropboxProvider extends DropboxClient {
  constructor() {
    super({
      clientId: Constants.ApplicationId,
      authUrl: Constants.HostUrl });
  }

  /**
   * Indicates if we've connected in the past on the basis of settings
   * @returns {Promise.<boolean>}
   */
  async hasConnected() {
    const oauth = await settings.oauth.get();
    const name = await settings.name.get();
    const email = await settings.email.get();
    const avatar = await settings.avatar.get();
    return oauth && name && email && avatar;
  }

  /**
   * Clears all authentication data from settings
   */
  async clear() {
    await settings.pkce.delete();
    await settings.oauth.delete();
    await settings.name.delete();
    await settings.email.delete();
    await settings.avatar.delete();
    this.connected = false;
  }

  /**
   * Attempts to connect
   * @returns {Promise.<boolean>} Promise<boolean>
   */
  async startFromToken() {
    const oauthToken = await settings.oauth.get();
    if (oauthToken && oauthToken.refresh_token) {
      this.refreshToken = oauthToken.refresh_token;
      if (await this.connect()) {
        log.debug('Connected using stored access token');
        log.info(`Logged in as ${this.accountName} (${this.accountEmail})`);
        await settings.name.set(this.accountName);
        await settings.email.set(this.accountEmail);
        await settings.avatar.set(this.accountAvatar);
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
      const pkceParams = await settings.pkce.get();
      if (pkceParams) {
        pkceParams.code = code;
        const oauthToken = await this.pkceFinish(pkceParams);
        if (oauthToken && await this.connect()) {
          log.debug('Connected using url access token');
          log.info(`Logged in as ${this.accountName} (${this.accountEmail})`);
          await settings.oauth.set(oauthToken);
          await settings.name.set(this.accountName);
          await settings.email.set(this.accountEmail);
          await settings.avatar.set(this.accountAvatar);
          await settings.pkce.delete();
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
  async authenticate(window) {
    if (window === undefined) {
      log.error('window parameter must be specified');
      throw new Error('window parameter must be specified');
    }

    // Initiate sign in
    await this.clear();
    const params = this.pkceStart();
    await settings.pkce.set(params);
    window.location.href = params.url;
    return false;
  }

  /**
   * Start
   * @param {Window} window
   * @returns {Promise.<boolean>} Promise<boolean>
   */
  async start(window) {
    if (!await this.hasConnected()) {
      if (await this.startFromToken()) {
        return true;
      }
      if (await this.startFromQueryString(window.location.search)) {
        return true;
      }
      return false;
    } else {
      this.connected = true;
      this.cursor = await settings.cursor.get();
      this.accountName = await settings.name.get();
      this.accountEmail = await settings.email.get();
      this.accountAvatar = await settings.avatar.get();
      const oauthToken = await settings.oauth.get();
      if (oauthToken && oauthToken.refresh_token) {
        this.refreshToken = oauthToken.refresh_token;
      }
      log.info(`Logged in as ${this.accountName} (${this.accountEmail}) (cached)`);
      return true;
    }
  }
}

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
   * Clears all authentication data from settings
   */
  async accountClear() {
    await Promise.all([
      settings.name.delete(),
      settings.email.delete(),
      settings.avatar.delete(),
      settings.pkce.delete(),
      settings.oauth.delete(),
    ]);
    this.connected = false;
  }

  /**
   * @returns {Promise.<RemoteAccount>}
   */
  async accountLoad() {
    return {
      name: await settings.name.get(),
      email: await settings.email.get(),
      avatar: await settings.avatar.get(),
      oauth: await settings.oauth.get()
    };
  }

  /**
   * 
   * @param {RemoteAccount} account 
   * @returns {Promise.<void>}
   */
  async accountSave(account) {
    await Promise.all([
      settings.name.set(account.name),
      settings.email.set(account.email),
      settings.avatar.set(account.avatar),
      settings.oauth.set(account.oauth)
    ]);
  }

  /**
   * Attempts to connect
   * @param {OAuthToken} [oauth]
   * @returns {Promise.<boolean>} Promise<boolean>
   */
  async startFromToken(oauth) {
    oauth = oauth || await settings.oauth.get();
    if (await super.startFromToken(oauth)) {
      log.debug('Connected using stored access token');
      log.info(`Logged in as ${this.account.name} (${this.account.email})`);
      await this.accountSave(this.account);      
      return true;
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
        const oauth = await this.pkceFinish(pkceParams);
        return await this.startFromToken(oauth);
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
    await this.accountClear();
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
    const account = await this.accountLoad();

    if (account.oauth && account.name) {
      this.connected = true;
      this.cursor = await settings.cursor.get();
      this.account = account;
      if (account.oauth && account.oauth.refresh_token) {
        this.refreshToken = account.oauth.refresh_token;
      }
      log.info(`Logged in as ${this.account.name} (${this.account.email}) (cached)`);
      return true;
    } else {
      if (await this.startFromToken()) {
        return true;
      }
      if (await this.startFromQueryString(window.location.search)) {
        return true;
      }
      return false;
    }
  }
}

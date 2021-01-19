import Constants from '../constants';
import DropboxClient from './dropbox-client';
import Logger from '../logger';
import QueryString from '../utils/query-string';
import Settings from '../settings';

const settings = Settings.instance();
const log = Logger.get('DropboxManager');

export default class DropboxProvider extends DropboxClient implements RemoteProvider {
  constructor() {
    super({
      clientId: Constants.ApplicationId,
      authUrl: Constants.HostUrl });
  }

  /**
   * Clears all authentication data from settings
   */
  async accountClear(): Promise<void> {
    await Promise.all([
      settings.name.delete(),
      settings.email.delete(),
      settings.avatar.delete(),
      settings.pkce.delete(),
      settings.oauth.delete(),
    ]);
    this.connected = false;
  }

  private async accountLoad(): Promise<RemoteAccount> {
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
  private async accountSave(account: RemoteAccount): Promise<void> {
    await Promise.all([
      settings.name.set(account.name!),
      settings.email.set(account.email!),
      settings.avatar.set(account.avatar!),
      settings.oauth.set(account.oauth!)
    ]);
  }

  /**
   * Attempts to connect
   */
  protected async startFromToken(oauth?: OAuthToken | undefined): Promise<boolean> {
    oauth = oauth || await settings.oauth.get();
    if (await super.startFromToken(oauth as OAuthToken)) {
      log.debug('Connected using stored access token');
      log.info(`Logged in as ${this.account.name} (${this.account.email})`);
      await this.accountSave(this.account);      
      return true;
    }
    return false;
  }

  /**
   * Attempts to connect
   */
  private async startFromQueryString(queryString: string): Promise<boolean> {
    const code = QueryString.parse(queryString).code as string;
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
   */
  async authenticate(window: Window): Promise<boolean> {
    if (window === undefined) {
      log.error('window parameter must be specified');
      throw new Error('window parameter must be specified');
    }

    // Initiate sign in
    await this.accountClear();
    const params = this.pkceStart();
    await settings.pkce.set(params);
    window.location.href = params.url as string;
    return false;
  }

  /**
   * Start
   */
  async start(window: Window): Promise<boolean> {
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

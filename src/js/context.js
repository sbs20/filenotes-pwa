import Constants from './constants';
import DropboxService from './dropbox-service';
import LocalProvider from './local-provider';
import Log from './log';
import StorageManager from './storage/storage-manager';

const local = Symbol();
const remote = Symbol();
const storage = Symbol();

class Context {
  constructor() {
    this[local] = new LocalProvider();
    this[remote] = new DropboxService();
    this[storage] = StorageManager;
    this.log = Log.get('Context');
  }

  /**
   * @returns {import('./storage/storage-manager').default StorageManager} - StorageManager
   */
  get storage() {
    return this[storage];
  }

  /**
   * @returns {LocalProvider} - LocalProvider
   */
  get local() {
    return this[local];
  }

  /**
   * @returns {DropboxService} - RemoteProvider
   */
  get remote() {
    return this[remote];
  }

  /**
   * Attempts to connect and if not forces authentication
   * @param {Window} window
   * @returns {Promise.<void>} Promise<void>
   */
  async connect(window) {
    // Try local storage first
    let accessToken = await StorageManager.settings.get('accessToken');
    if (await this.remote.connect({ clientId: Constants.APP_ID, accessToken: accessToken })) {
      this.log.debug('Connected using stored access token');
      return;
    }

    if (window === undefined) {
      this.log.error('window parameter must be specified');
      throw new Error('window parameter must be specified');
    }

    // If that didn't work, see if there's anything in the URL
    accessToken = this.remote.authenticationToken(window.location.hash);
    if (await this.remote.connect({ clientId: Constants.APP_ID, accessToken: accessToken })) {
      this.log.debug('Connected using url access token');
      await StorageManager.settings.set('accessToken', accessToken);
      return;
    }

    // Initiate sign in
    this.remote.configure({ clientId: Constants.APP_ID, authUrl: Constants.HOST_URL });
    const uri = this.remote.authenticationUrl();
    window.location.href = uri;
  }
}

const context = new Context();

export default context;

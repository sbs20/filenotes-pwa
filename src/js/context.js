import Constants from './constants';
import DropboxService from './dropbox-service';
import LocalProvider from './local-provider';
import StorageManager from './storage/storage-manager';

const local = Symbol();
const remote = Symbol();
const storage = Symbol();

class Context {
  constructor() {
    this[local] = new LocalProvider();
    this[remote] = new DropboxService();
    this[storage] = StorageManager;
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

  // Goes in DropboxService
  async start(window) {
    const connect = async (accessToken) => {
      if (accessToken === undefined) {
        return false;
      }
      this.remote.configure({ clientId: Constants.APP_ID, accessToken: accessToken });
      return await this.remote.connect();
    };

    // Try local storage first
    let accessToken = await StorageManager.settings.get('accessToken');
    if (accessToken !== undefined && await connect(accessToken)) {
      return;
    }

    if (window === undefined) {
      throw new Error('window parameter must be specified');
    }

    // If that didn't work, see if there's anything in the URL
    accessToken = this.remote.authenticationToken(window.location.hash);
    if (accessToken !== undefined && await connect(accessToken)) {
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

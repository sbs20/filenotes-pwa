import Constants from './constants';
import DropboxProvider from './cloud/dropbox-provider';
import Settings from './settings';
import SyncEngine from './sync-engine';

let instance = null;

export default class Context {
  constructor() {
    this._remote = null;
    this._sync = null;
  }

  /**
   * @returns {Promise.<void>}
   */
  async init() {
    const service = await Settings.instance().storageService.get();
    switch (service) {
      case Constants.StorageServices.Dropbox:
        this._remote = new DropboxProvider();
        break;

      default:
        this._remote = undefined;
        break;
    }
    this._sync = new SyncEngine(this._remote);
  }

  /**
   * Calculates the content hash
   * @param {BufferLike} buffer - The byte array
   * @returns {string} - Hex encoded hash
   */
  hash(buffer) {
    if (this._remote) {
      return this._remote.hash(buffer);
    }
    return '';
  }

  /**
   * @returns {DropboxProvider}
   */
  get remote() {
    return this._remote;
  }

  /**
   * @returns {SyncEngine}
   */
  get sync() {
    return this._sync;
  }

  /**
   * @returns {Context}
   */
  static instance() {
    if (instance === null) {
      instance = new Context();
    }
    return instance;
  }
}

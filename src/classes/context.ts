import Constants from './constants';
import DropboxProvider from './cloud/dropbox-provider';
import Settings from './settings';
import SyncEngine from './sync-engine';

let instance: Context | null = null;

export default class Context {
  private _remote: IRemoteProvider | null;
  private _sync: SyncEngine | null;

  constructor() {
    this._remote = null;
    this._sync = null;
  }

  async init(): Promise<void> {
    const service = await Settings.instance().storageService.get();
    switch (service) {
      case Constants.StorageServices.Dropbox:
        this._remote = new DropboxProvider();
        break;

      default:
        this._remote = null;
        break;
    }
    this._sync = new SyncEngine(this._remote);
  }

  /**
   * Calculates the content hash
   */
  hash(buffer: BufferLike): string {
    if (this._remote) {
      return this._remote.hash(buffer);
    }
    return '';
  }

  get remote(): IRemoteProvider | null {
    return this._remote;
  }

  get sync(): SyncEngine | null {
    return this._sync;
  }

  static instance(): Context {
    if (instance === null) {
      instance = new Context();
    }
    return instance;
  }
}

import Storage from '../data/storage';
import Engine from '../sync/engine';
import DropboxProvider from '../dropbox/dropbox-provider';

const StorageService = new Storage();
const SyncEngine = new Engine();
const Hasher = {
  hash: DropboxProvider.hash
};

export { StorageService, SyncEngine, Hasher };
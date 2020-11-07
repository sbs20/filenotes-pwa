import Storage from '../data/storage';
import Engine from '../sync2/engine';
import hash from '../dropbox/dropbox-hasher';

const StorageService = new Storage();
const SyncEngine = new Engine();
const Hasher = {
  hash: hash
};

export { StorageService, SyncEngine, Hasher };
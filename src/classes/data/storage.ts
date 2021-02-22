import Database, {STORE_FS_CONTENT, STORE_FS_DELTA, STORE_FS_METADATA, STORE_SETTINGS} from './database';
import KeyValueStore from './key-value-store';
import Store from './store';

let storage: Storage | null = null;

interface Filesystem {
  metadata: Store<IMetadata>;
  content: Store<IContent>;
  delta: Store<IMetadata>;
}

export default class Storage {
  fs: Filesystem;
  settings: KeyValueStore;

  constructor() {
    this.fs = {
      metadata: new Store<IMetadata>(STORE_FS_METADATA),
      content: new Store<IContent>(STORE_FS_CONTENT),
      delta: new Store<IMetadata>(STORE_FS_DELTA)  
    };
    this.settings = new KeyValueStore(STORE_SETTINGS);
  }

  async deleteDatabase(): Promise<void> {
    await Database.delete();
  }

  static instance(): Storage {
    if (storage === null) {
      storage = new Storage();
    }
    return storage;
  }
}

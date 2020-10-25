import {STORE_FS_CONTENT, STORE_FS_DELTA, STORE_FS_METADATA, STORE_QUEUE, STORE_SETTINGS} from './database';
import AutoIncrement from './auto-increment';
import FileStore from './file-store';
import KeyValuePair from './key-value-pair';

class StorageManager {
  constructor() {
    this.fs = {
      metadata: new FileStore(STORE_FS_METADATA),
      content: new FileStore(STORE_FS_CONTENT),
      delta: new AutoIncrement(STORE_FS_DELTA)  
    };
    this.settings = new KeyValuePair(STORE_SETTINGS);
    this.queue = new FileStore(STORE_QUEUE);
  }
}

const instance = new StorageManager();
export default instance;

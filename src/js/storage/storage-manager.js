import {STORE_FS_CONTENT, STORE_FS_DELTA, STORE_FS_METADATA, STORE_QUEUE, STORE_SETTINGS} from './database';
import AutoIncrementStore from './auto-increment-store';
import FileStore from './file-store';
import KeyValueStore from './key-value-store';

class StorageManager {
  constructor() {
    this.fs = {
      metadata: new FileStore(STORE_FS_METADATA),
      content: new FileStore(STORE_FS_CONTENT),
      delta: new AutoIncrementStore(STORE_FS_DELTA)  
    };
    this.settings = new KeyValueStore(STORE_SETTINGS);
    this.queue = new FileStore(STORE_QUEUE);
  }
}

const instance = new StorageManager();
export default instance;

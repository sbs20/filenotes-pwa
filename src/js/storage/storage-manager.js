import Database, {STORE_FS_CONTENT, STORE_FS_DELTA, STORE_FS_METADATA, STORE_SETTINGS} from '../data/database';
import FileStore from '../data/file-store';
import KeyValueStore from '../data/key-value-store';

class StorageManager {
  constructor() {
    this.fs = {
      metadata: new FileStore(STORE_FS_METADATA),
      content: new FileStore(STORE_FS_CONTENT),
      delta: new FileStore(STORE_FS_DELTA)  
    };
    this.settings = new KeyValueStore(STORE_SETTINGS);
  }

  deleteDatatabase() {
    new Database().delete();
  }
}

const instance = new StorageManager();
export default instance;

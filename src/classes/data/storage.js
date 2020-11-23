import Database, {STORE_FS_CONTENT, STORE_FS_DELTA, STORE_FS_METADATA, STORE_SETTINGS} from './database';
import ContentStore from './content-store';
import FileStore from './file-store';
import KeyValueStore from './key-value-store';

export default class Storage {
  constructor() {
    this.fs = {
      metadata: new FileStore(STORE_FS_METADATA),
      content: new ContentStore(STORE_FS_CONTENT),
      delta: new FileStore(STORE_FS_DELTA)  
    };
    this.settings = new KeyValueStore(STORE_SETTINGS);
  }

  deleteDatatabase() {
    new Database().delete();
  }
}

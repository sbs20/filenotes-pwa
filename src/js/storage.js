/*
tables:
  settings {key, value}
    accessToken
    localCursor
    remoteCursor
  fs.metadata

  fs.data
  actions
*/

import { openDB } from 'idb';

const DB_NAME = 'filenotes.app';
const DB_VERSION = 1;
const STORE_SETTINGS = 'settings';
const STORE_FS = 'fs';

class Storage {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db === null) {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          db.createObjectStore(STORE_SETTINGS);
          db.createObjectStore(STORE_FS, {
            keyPath: 'pathLower'
          });
        }
      });  
    }
  }

  async setting(key, value) {
    await this.init();
    if (value === undefined) {
      return await this.db.get(STORE_SETTINGS, key);
    } else if (value === null) {
      await this.db.delete(STORE_SETTINGS, key);
    } else {
      await this.db.put(STORE_SETTINGS, value, key);
    }
  }
}

const storage = new Storage();

export default storage;
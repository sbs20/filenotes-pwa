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

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    db.createObjectStore(STORE_SETTINGS);
    db.createObjectStore(STORE_FS, {
      keyPath: 'pathLower'
    });
  }
});

export default {
  settings: {
    async get(key) {
      return (await dbPromise).get(STORE_SETTINGS, key);
    },
    async set(key, val) {
      return (await dbPromise).put(STORE_SETTINGS, val, key);
    },
    async delete(key) {
      return (await dbPromise).delete(STORE_SETTINGS, key);
    },
    async clear() {
      return (await dbPromise).clear(STORE_SETTINGS);
    },
    async keys() {
      return (await dbPromise).getAllKeys(STORE_SETTINGS);
    },  
  }
};
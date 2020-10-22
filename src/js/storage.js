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
const STORE_QOUT = 'qout';
const STORE_QIN = 'qin';

const useDb = async (consumer) => {
  const idb = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE_SETTINGS);
      db.createObjectStore(STORE_FS, { keyPath: 'key' });
      db.createObjectStore(STORE_QOUT, { keyPath: 'key' });
      db.createObjectStore(STORE_QIN, { keyPath: 'key' });
    },
    blocked() {
      console.log('blocked');
    },
    blocking() {
      console.log('blocking');
    }
  });
  const response = consumer(idb);
  idb.close();
  return response;
};


export default {
  settings: {
    async get(key) {
      return await useDb(idb => idb.get(STORE_SETTINGS, key));
    },
    async set(key, val) {
      await useDb(idb => idb.put(STORE_SETTINGS, val, key));
      // return (await instance()).put(STORE_SETTINGS, val, key);
    },
    async delete(key) {
      await useDb(idb => idb.delete(STORE_SETTINGS, key));
      // return (await instance()).delete(STORE_SETTINGS, key);
    },
    async clear() {
      // return (await instance()).clear(STORE_SETTINGS);
    },
    async keys() {
      // return (await instance()).getAllKeys(STORE_SETTINGS);
    },  
  }
};
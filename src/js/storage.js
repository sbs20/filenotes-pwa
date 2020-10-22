import { openDB } from 'idb';

const DB_NAME = 'filenotes.app';
const DB_VERSION = 1;
const STORE_SETTINGS = 'settings';
const STORE_FS = 'fs';
const STORE_QOUT = 'qout';
const STORE_QIN = 'qin';

class Storage {
  constructor() {
    this.db = null;
  }

  async open() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
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
  }

  close() {
    this.db.close();
    this.db = null;
  }

  static async use(dbConsumer) {
    const storage = new Storage();
    await storage.open();
    let response = null;
    try {
      response = await dbConsumer(storage.db);
    } catch { /*Nothing*/ }
    storage.close();
    return response;  
  }
}

class FileStore {
  constructor(store) {
    this.store = store;
  }

  async list() {
    return await Storage.use(idb => idb.getAllKeys(this.store));
  }

  async delete(item) {
    await Storage.use(idb => idb.delete(this.store, item));
  }

  async create(items) {
    await Storage.use(async idb => {
      const tx = idb.transaction(this.store, 'readwrite');
      const transactions = items.map(item => tx.store.put(item));
      transactions.push(tx.done);
      await Promise.all(transactions);
    });
  }
}

export default {
  settings: {
    async get(key) {
      return await Storage.use(idb => idb.get(STORE_SETTINGS, key));
    },
    async set(key, val) {
      await Storage.use(idb => idb.put(STORE_SETTINGS, val, key));
    },
    async delete(key) {
      await Storage.use(idb => idb.delete(STORE_SETTINGS, key));
    },
    async clear() {
      await Storage.use(idb => idb.clear(STORE_SETTINGS));
    },
    async keys() {
      return await Storage.use(idb => idb.getAllKeys(STORE_SETTINGS));
    },  
  },

  queueIn: new FileStore(STORE_QIN),
  queueOut: new FileStore(STORE_QOUT),
  fs: new FileStore(STORE_FS),
};
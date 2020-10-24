import { openDB } from 'idb';

const DB_NAME = 'filenotes.app';
const DB_VERSION = 1;
const STORE_SETTINGS = 'settings';
const STORE_FS_METADATA = 'fs.metadata';
const STORE_FS_CONTENT = 'fs.content';
const STORE_FS_DELTA = 'fs.delta';
const STORE_QUEUE = 'queue';

class Storage {
  constructor() {
    this.db = null;
  }

  async open() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE_SETTINGS);
        db.createObjectStore(STORE_FS_METADATA, { keyPath: 'key' });
        db.createObjectStore(STORE_FS_CONTENT, { keyPath: 'key' });
        db.createObjectStore(STORE_FS_DELTA, { autoIncrement: true });
        db.createObjectStore(STORE_QUEUE, { autoIncrement: true });
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

class KeyValuePair {
  constructor(store) {
    this.store = store;
  }

  async get(key) {
    return await Storage.use(idb => idb.get(this.store, key));
  }

  async set(key, val) {
    await Storage.use(idb => idb.put(this.store, val, key));
  }

  async delete(key) {
    await Storage.use(idb => idb.delete(this.store, key));
  }

  async clear() {
    await Storage.use(idb => idb.clear(this.store));
  }

  async keys() {
    return await Storage.use(idb => idb.getAllKeys(this.store));
  }
}

class FileStore {
  constructor(store) {
    this.store = store;
  }

  async delete(item) {
    await Storage.use(idb => idb.delete(this.store, item));
  }

  async keys() {
    return await Storage.use(idb => idb.getAllKeys(this.store));
  }

  async list() {
    return await Storage.use(idb => idb.getAll(this.store));
  }

  async read(key) {
    return await Storage.use(idb => idb.get(this.store, key));
  }

  async write(items) {
    await Storage.use(async idb => {
      const tx = idb.transaction(this.store, 'readwrite');
      const transactions = items.map(item => tx.store.put(item));
      transactions.push(tx.done);
      await Promise.all(transactions);
    });
  }
}

class AutoIncrement {
  constructor(store) {
    this.store = store;
  }

  async keys() {
    return await Storage.use(idb => idb.getAllKeys(this.store));
  }

  async list() {
    return await Storage.use(idb => idb.getAll(this.store));
  }

  async delete(id) {
    await Storage.use(idb => idb.delete(this.store, id));
  }

  async write(items) {
    await Storage.use(async idb => {
      const tx = idb.transaction(this.store, 'readwrite');
      const transactions = items.map(item => tx.store.put(item));
      transactions.push(tx.done);
      await Promise.all(transactions);
    });
  }
}

export default {
  fs: {
    metadata: new FileStore(STORE_FS_METADATA),
    content: new FileStore(STORE_FS_CONTENT),
    delta: new AutoIncrement(STORE_FS_DELTA)
  },
  settings: new KeyValuePair(STORE_SETTINGS),
  queue: new FileStore(STORE_QUEUE),
};
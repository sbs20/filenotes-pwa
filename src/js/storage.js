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
  /**
   * Creates a new KeyValuePair
   * @param {string} store - The store name 
   */
  constructor(store) {
    this.store = store;
  }

  /**
   * Gets a value
   * @returns {Promise.<any>>}
   */
  async get(key) {
    return await Storage.use(idb => idb.get(this.store, key));
  }

  /**
   * Sets a value
   * @param {string} key 
   * @param {any} val 
   * @returns {Promise.<void>>}
   */
  async set(key, val) {
    await Storage.use(idb => idb.put(this.store, val, key));
  }

  /**
   * Deletes a value
   * @returns {Promise.<void>>}
   */
  async delete(key) {
    await Storage.use(idb => idb.delete(this.store, key));
  }

  /**
   * Clears the store
   * @returns {Promise.<void>>}
   */
  async clear() {
    await Storage.use(idb => idb.clear(this.store));
  }

  /**
   * Returns a list of keys
   * @returns {Promise.<Array.<string>>}
   */
  async keys() {
    return await Storage.use(idb => idb.getAllKeys(this.store));
  }
}

class FileStore {
  /**
   * Creates a new FileStore
   * @param {string} store - The store name 
   */
  constructor(store) {
    this.store = store;
  }

  /**
   * Deletes a file metadata
   * @param {string} key - The metadata.key
   * @returns {Promise.<void>>}
   */
  async delete(key) {
    await Storage.use(idb => idb.delete(this.store, key));
  }

  /**
   * Returns a list of file metadata keys
   * @returns {Promise.<Array.<string>>}
   */
  async keys() {
    return await Storage.use(idb => idb.getAllKeys(this.store));
  }

  /**
   * Returns a list of file metadata objects
   * @returns {Promise.<Array.<Metadata>>}
   */
  async list() {
    return await Storage.use(idb => idb.getAll(this.store));
  }

  /**
   * Returns a file metadata object
   * @param {string} key - The metadata.key
   * @returns {Promise.<Metadata>}
   */
  async read(key) {
    return await Storage.use(idb => idb.get(this.store, key));
  }

  /**
   * Writes a list of metadata items
   * @param {Array.<Metadata>} items 
   */
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
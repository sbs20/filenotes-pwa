import Database from './database';

export default class FileStore {
  /**
   * Creates a new FileStore
   * @param {string} store - The store name 
   */
  constructor(store) {
    this.store = store;
  }

  /**
   * Clears the file store
   * @returns {Promise.<void>>} Promise<void>
   */
  async clear() {
    await Database.use(idb => idb.clear(this.store));
  }

  /**
   * Deletes a file entry
   * @param {Array.<string>} keys - The keys
   * @returns {Promise.<void>>} Promise<void>
   */
  async deleteAll(keys) {
    await Database.use(async idb => {
      const tx = idb.transaction(this.store, 'readwrite');
      const transactions = keys.map(key => tx.store.delete(key));
      transactions.push(tx.done);
      await Promise.all(transactions);
    });
  }

  /**
   * Returns a list of file metadata keys
   * @returns {Promise.<Array.<string>>} Promise<string[]>
   */
  async keys() {
    return await Database.use(idb => idb.getAllKeys(this.store));
  }

  /**
   * Returns a list of file metadata objects
   * @returns {Promise.<Array.<Metadata>>} Promise<Metadata[]>
   */
  async list() {
    return await Database.use(idb => idb.getAll(this.store));
  }

  /**
   * Returns a file metadata object
   * @param {string} key - The metadata.key
   * @returns {Promise.<Metadata>} Promise<Metadata>
   */
  async read(key) {
    return await Database.use(idb => idb.get(this.store, key));
  }

  /**
   * Writes a list of metadata items
   * @param {Array.<Metadata>} items - The items to write
   * @returns {Promise.<void>} Promise<void>
   */
  async writeAll(items) {
    await Database.use(async idb => {
      const tx = idb.transaction(this.store, 'readwrite');
      const transactions = items.map(item => tx.store.put(item));
      transactions.push(tx.done);
      await Promise.all(transactions);
    });
  }
}

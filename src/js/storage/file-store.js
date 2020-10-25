/**
 * @typedef {import('../typedefs/types').Metadata} Metadata
 */

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
   * Deletes a file metadata
   * @param {string} key - The metadata.key
   * @returns {Promise.<void>>} Promise<void>
   */
  async delete(key) {
    await Database.use(idb => idb.delete(this.store, key));
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
   */
  async write(items) {
    await Database.use(async idb => {
      const tx = idb.transaction(this.store, 'readwrite');
      const transactions = items.map(item => tx.store.put(item));
      transactions.push(tx.done);
      await Promise.all(transactions);
    });
  }
}

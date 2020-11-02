import Database from './database';

export default class AutoIncrementStore {
  constructor(store) {
    this.store = store;
  }

  /**
   * Clears the store
   * @returns {Promise.<void>>} Promise<void>
   */
  async clear() {
    await Database.use(idb => idb.clear(this.store));
  }

  /**
   * Deletes a value
   * @param {number} id The key
   * @returns {Promise.<void>>} Promise<void>
   */
  async delete(id) {
    await Database.use(idb => idb.delete(this.store, id));
  }

  /**
   * Returns a list of file metadata keys
   * @returns {Promise.<Array.<Number>>} Promise<number[]>
   */
  async keys() {
    return await Database.use(idb => idb.getAllKeys(this.store));
  }

  /**
   * Returns a list of items
   * @returns {Promise.<Array.<any>>} Promise<any[]>
   */
  async list() {
    return await Database.use(idb => idb.getAll(this.store));
  }

  /**
   * Writes a list of items
   * @param {Array.<any>} items - The items to write
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
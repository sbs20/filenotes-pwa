import Database from './database';

export default class GenericStore {
  /**
   * Creates a new GenericStore
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
   * Returns a list of keys
   * @returns {Promise.<Array.<string>>} Promise<string[]>
   */
  async keys() {
    return await Database.use(idb => idb.getAllKeys(this.store));
  }

  /**
   * Returns a list of objects
   * @param {function(string, any):boolean} [predicate]
   * @returns {Promise.<Array.<any>>} Promise<any[]>
   */
  async list(predicate) {
    if (predicate === undefined) {
      return await Database.use(idb => idb.getAll(this.store));
    }

    return await Database.use(async idb => {
      let cursor = await idb.transaction(this.store).store.openCursor();
      const items = [];
      while (cursor) {
        if (predicate(cursor.key, cursor.value)) {
          items.push(cursor.value);
        }
        cursor = await cursor.continue();
      }
      return items;
    });
  }

  /**
   * Returns a file metadata object
   * @param {string} key - The metadata.key
   * @returns {Promise.<any>} Promise<any>
   */
  async read(key) {
    return await Database.use(idb => idb.get(this.store, key));
  }

  /**
   * Writes a list of  items
   * @param {Array.<any>} items - The items to write
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

import Database from './database';

export default class KeyValuePair {
  /**
   * Creates a new KeyValuePair
   * @param {string} store - The store name 
   */
  constructor(store) {
    this.store = store;
  }

  /**
   * Gets a value
   * @returns {Promise.<any>>} Promise<any>
   */
  async get(key) {
    return await Database.use(idb => idb.get(this.store, key));
  }

  /**
   * Sets a value
   * @param {string} key The key
   * @param {any} val The value
   * @returns {Promise.<void>>} Promise<void>
   */
  async set(key, val) {
    await Database.use(idb => idb.put(this.store, val, key));
  }

  /**
   * Deletes a value
   * @param {string} key The key
   * @returns {Promise.<void>>} Promise<void>
   */
  async delete(key) {
    await Database.use(idb => idb.delete(this.store, key));
  }

  /**
   * Clears the store
   * @returns {Promise.<void>>} Promise<void>
   */
  async clear() {
    await Database.use(idb => idb.clear(this.store));
  }

  /**
   * Returns a list of keys
   * @returns {Promise.<Array.<string>>} Promise<string[]>
   */
  async keys() {
    return await Database.use(idb => idb.getAllKeys(this.store));
  }
}

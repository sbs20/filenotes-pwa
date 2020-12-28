import Database from './database';

export default class KeyValueStore {
  store: string;

  /**
   * Creates a new KeyValuePair
   */
  constructor(store: string) {
    this.store = store;
  }

  /**
   * Gets a value
   */
  async get(key: string): Promise<any> {
    return await Database.use(idb => idb.get(this.store, key));
  }

  /**
   * Sets a value
   */
  async set(key: string, val: any): Promise<void> {
    await Database.use(idb => idb.put(this.store, val, key));
  }

  /**
   * Deletes a value
   */
  async delete(key: string): Promise<void> {
    await Database.use(idb => idb.delete(this.store, key));
  }

  /**
   * Clears the store
   */
  async clear(): Promise<void> {
    await Database.use(idb => idb.clear(this.store));
  }

  /**
   * Returns a list of keys
   */
  async keys(): Promise<string[]> {
    return await Database.use(idb => idb.getAllKeys(this.store));
  }
}

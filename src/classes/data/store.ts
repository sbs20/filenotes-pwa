import { IDBPCursorWithValue } from 'idb';
import Database from './database';

export default class Store<T> {
  store: string;

  constructor(store: string) {
    this.store = store;
  }

  /**
   * Clears the file store
   */
  async clear(): Promise<void> {
    await Database.use(idb => idb.clear(this.store));
  }

  /**
   * Deletes a file entry
   */
  async deleteAll(keys: string[]): Promise<void> {
    await Database.use(async idb => {
      const tx = idb.transaction(this.store, 'readwrite');
      const transactions = keys.map(key => tx.store.delete(key));
      transactions.push(tx.done);
      await Promise.all(transactions);
    });
  }

  /**
   * Returns a list of keys
   */
  async keys(): Promise<string[]> {
    return await Database.use(idb => idb.getAllKeys(this.store));
  }

  /**
   * Returns a list of objects
   */
  async list(predicate?: (key: string, value: any) => boolean): Promise<T> {
    if (predicate === undefined) {
      return await Database.use(idb => idb.getAll(this.store));
    }

    return await Database.use(async idb => {
      let cursor: IDBPCursorWithValue | null = await idb.transaction(this.store).store.openCursor();
      const items: T[] = [];
      while (cursor) {
        if (predicate(cursor.key as string, cursor.value)) {
          items.push(cursor.value);
        }
        cursor = await cursor.continue();
      }
      return items;
    });
  }

  /**
   * Returns a file metadata object
   */
  async read(key: string): Promise<T> {
    return await Database.use(idb => idb.get(this.store, key));
  }

  /**
   * Writes a list of  items
   */
  async writeAll(items: T[]): Promise<void> {
    await Database.use(async idb => {
      const tx = idb.transaction(this.store, 'readwrite');
      const transactions: Promise<any>[] = items.map(item => tx.store.put(item));
      transactions.push(tx.done);
      await Promise.all(transactions);
    });
  }
}

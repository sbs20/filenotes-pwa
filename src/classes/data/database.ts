// eslint-disable-next-line
import { openDB, deleteDB, IDBPDatabase } from 'idb';

export const DB_NAME = 'filenotes.app';
export const DB_VERSION = 1;
export const STORE_SETTINGS = 'settings';
export const STORE_FS_METADATA = 'fs.metadata';
export const STORE_FS_CONTENT = 'fs.content';
export const STORE_FS_DELTA = 'fs.delta';

export default class Database {
  constructor() {
  }

  /**
   * Opens the database
   */
  static async open(): Promise<IDBPDatabase> {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE_SETTINGS);
        db.createObjectStore(STORE_FS_METADATA, { keyPath: 'key' });
        db.createObjectStore(STORE_FS_CONTENT, { keyPath: 'key' });
        db.createObjectStore(STORE_FS_DELTA, { keyPath: 'key' });
      },
      blocked() {
        console.log('blocked');
      },
      blocking() {
        console.log('blocking');
      }
    });  
  }

  /**
   * Deletes the database
   */
  static async delete(): Promise<void> {
    await deleteDB(DB_NAME, {});
  }

  /**
   * Opens and closes a database using the callback in the middle
   */
  static async use(callback: (db: IDBPDatabase) => any): Promise<any> {
    const idb: IDBPDatabase = await Database.open();
    let response = null;
    try {
      response = await callback(idb);
    } catch { /*Nothing*/ }
    idb.close();
    return response;  
  }
}

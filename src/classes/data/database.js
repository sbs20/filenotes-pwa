/**
 * @typedef {import('idb').IDBPDatabase} IDBPDatabase
 */

import { openDB, deleteDB } from 'idb';

export const DB_NAME = 'filenotes.app';
export const DB_VERSION = 1;
export const STORE_SETTINGS = 'settings';
export const STORE_FS_METADATA = 'fs.metadata';
export const STORE_FS_CONTENT = 'fs.content';
export const STORE_FS_DELTA = 'fs.delta';

export default class Database {
  constructor() {
    this.db = null;
  }

  /**
   * Opens the database
   */
  async open() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
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
  async delete() {
    await deleteDB(DB_NAME, {});
  }

  /**
   * Closes the underlying database
   */
  close() {
    this.db.close();
    this.db = null;
  }

  /**
    * Opens and closes a database using the callback in the middle
    * @param {function(IDBPDatabase)} callback 
    */
  static async use(callback) {
    const database = new Database();
    await database.open();
    let response = null;
    try {
      response = await callback(database.db);
    } catch { /*Nothing*/ }
    database.close();
    return response;  
  }
}

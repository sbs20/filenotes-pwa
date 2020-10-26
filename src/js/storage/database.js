import { openDB } from 'idb';

export const DB_NAME = 'filenotes.app';
export const DB_VERSION = 1;
export const STORE_SETTINGS = 'settings';
export const STORE_FS_METADATA = 'fs.metadata';
export const STORE_FS_CONTENT = 'fs.content';
export const STORE_FS_DELTA = 'fs.delta';
export const STORE_QUEUE = 'queue';

export default class Database {
  constructor() {
    this.db = null;
  }

  // TODO : Typedefs
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
    const database = new Database();
    await database.open();
    let response = null;
    try {
      response = await dbConsumer(database.db);
    } catch { /*Nothing*/ }
    database.close();
    return response;  
  }
}

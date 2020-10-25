/**
 * @typedef {import('../typedefs/types').Metadata} Metadata
 */

import FileProvider from './file-provider';
import StorageManager from './storage/storage-manager';

export default class LocalProvider extends FileProvider {

  /**
   * Returns a list of file metadata objects
   * @returns {Promise.<Array.<Metadata>>} - Promise<Metadata[]>
   */
  async list() {
    return await StorageManager.fs.metadata.list();
  }

  /**
   * Returns the file data as an ArrayBuffer
   * @param {string} path
   * @returns {Promise.<ArrayBuffer>} - Promise<ArrayBuffer>
   */
  async read(path) {
    return await StorageManager.fs.content.read(path);
  }
}

import FileProvider from './file-provider';
import Storage from './storage';

export default class LocalProvider extends FileProvider {  

  /**
   * Returns a list of file metadata objects
   * @returns {Promise.<Array.<Metadata>>} - Promise<Metadata[]>
   */
  async list() {
    return await Storage.fs.metadata.list();
  }

  /**
   * Returns the file data as an ArrayBuffer
   * @param {string} path
   * @returns {Promise.<ArrayBuffer>} - Promise<ArrayBuffer>
   */
  async read(path) {
    return await Storage.fs.content.read(path);
  }
}

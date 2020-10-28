import FileProvider from './file-provider';
import StorageManager from './storage/storage-manager';

export default class LocalProvider extends FileProvider {

  /**
   * Returns a metadata object
   * @returns {Promise.<Metadata>} - Promise<Metadata>
   */
  async get(path) {
    return await StorageManager.fs.metadata.read(path);
  }

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
    const content = await StorageManager.fs.content.read(path);
    return content.data;
  }

  /**
   * Writes file data to disk
   * @param {string} path 
   * @param {ArrayBuffer} data 
   */
  async write(path, data) {
    if (data) {
      /** @type {Metadata} */
      const metadata = {
        tag: 'file',
        key: path.toLowerCase(),
        name: '',
        modified: new Date().toISOString(),
        size: data.byteLength,
        hash: ''
      };

      /** @type {Content} */
      const content = {
        key: metadata.key,
        data: data
      };

      await StorageManager.fs.metadata.write([metadata]);
      await StorageManager.fs.content.write([content]);
      await StorageManager.fs.delta.write([metadata]);
    }
  }
}

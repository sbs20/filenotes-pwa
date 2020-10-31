import FileProvider from './file-provider';
import Log from './log';
import RemoteProvider from './remote-provider';
import StorageManager from './storage/storage-manager';

const log = Log.get('LocalProvider');

class LocalProvider extends FileProvider {

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
        name: path.split('/').slice(-1)[0],
        path: path,
        modified: new Date().toISOString(),
        size: data.byteLength,
        hash: await RemoteProvider.hash(data)
      };

      /** @type {Content} */
      const content = {
        key: metadata.key,
        data: data
      };

      // See what's stored locally already
      const current = await StorageManager.fs.metadata.read(metadata.key);
      if (current.hash !== metadata.hash) {
        log.debug(`${metadata.key} has changed`);
        await StorageManager.fs.metadata.writeAll([metadata]);
        await StorageManager.fs.content.writeAll([content]);
        await StorageManager.fs.delta.writeAll([metadata]);
      } else {
        log.debug(`${metadata.key} has not changed`);        
      }
    }
  }
}

const localProvider = new LocalProvider();
export default localProvider;

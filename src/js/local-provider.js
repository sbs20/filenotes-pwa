import FileProvider from './file-provider';
import Log from './log';
import FileEntry from './files/file-entry';
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
      const metadata = await FileEntry.createFileMetadata(path, data);
      const content = FileEntry.createContent(metadata.key, data);

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

  /**
   * Delete a file
   * @param {string} path 
   */
  async delete(path) {
    await StorageManager.fs.metadata.deleteAll([path.toLowerCase()]);
    await StorageManager.fs.content.deleteAll([path.toLowerCase()]);
    await StorageManager.fs.delta.writeAll([FileEntry.createDeletedMetadata(path)]);
  }

  /**
   * Moves a file
   * @param {string} path 
   * @param {string} destinationPath 
   */
  async move(path, destinationPath) {
    const content = await StorageManager.fs.content.read(path.toLowerCase());
    await this.write(destinationPath, content.data);
    await this.delete(path);
  }
}

const localProvider = new LocalProvider();
export default localProvider;

import FileContent from './files/file-content';
import FileMetadata from './files/file-metadata';
import Log from './log';
import { StorageService } from './service';

const log = Log.get('LocalProvider');

class LocalProvider {

  /**
   * Returns a metadata object
   * @returns {Promise.<Metadata>} - Promise<Metadata>
   */
  async get(path) {
    return await StorageService.fs.metadata.read(path);
  }

  /**
   * Returns a list of file metadata objects
   * @param {Metadata} [directory]
   * @returns {Promise.<Array.<Metadata>>} - Promise<Metadata[]>
   */
  async list(directory) {
    let list = await StorageService.fs.metadata.list();

    if (directory) {
      list = list.filter(metadata => {
        const fileKey = metadata.key;
        const dirKey = directory.key + '/';
        return fileKey.startsWith(dirKey) && fileKey.indexOf('/', dirKey.length) === -1;
      });  
    }

    return list;
  }

  /**
   * Returns the file data as an ArrayBuffer
   * @param {string} path
   * @returns {Promise.<ArrayBuffer>} - Promise<ArrayBuffer>
   */
  async read(path) {
    const content = await StorageService.fs.content.read(path);
    return content === undefined ? new Uint8Array().buffer : content.data;
  }

  /**
   * Writes file data to disk
   * @param {string} path 
   * @param {ArrayBuffer} data 
   */
  async write(path, data) {
    if (data) {
      const metadata = await FileMetadata.create(path, data);
      const content = FileContent.create(path, data);

      // See what's stored locally already
      const current = await StorageService.fs.metadata.read(metadata.key);
      if (current.hash !== metadata.hash) {
        log.debug(`${metadata.key} has changed`);
        await StorageService.fs.metadata.writeAll([metadata]);
        await StorageService.fs.content.writeAll([content]);
        await StorageService.fs.delta.writeAll([metadata]);
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
    // TODO handle folders
    await StorageService.fs.metadata.deleteAll([path.toLowerCase()]);
    await StorageService.fs.content.deleteAll([path.toLowerCase()]);
    await StorageService.fs.delta.writeAll([FileMetadata.createDeleted(path)]);
  }

  /**
   * Moves a file
   * @param {string} path 
   * @param {string} destinationPath 
   */
  async move(path, destinationPath) {
    // TODO handle folders
    const content = await StorageService.fs.content.read(path.toLowerCase());
    await this.write(destinationPath, content.data);
    await this.delete(path);
  }
}

const localProvider = new LocalProvider();
export default localProvider;

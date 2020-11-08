import FileContent from './files/file-content';
import FileMetadata from './files/file-metadata';
import FolderMetadata from './files/folder-metadata';
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
   * Creates a local directory
   * @param {string} path
   * @returns {Promise.<void>}
   */
  async mkdir(path) {
    const metadata = FolderMetadata.create(path);
    await StorageService.fs.metadata.writeAll([metadata]);
    await StorageService.fs.delta.writeAll([metadata]);    
  }

  /**
   * Returns a list of file metadata objects
   * @param {Metadata} [directory]
   * @param {boolean} [recursive]
   * @returns {Promise.<Array.<Metadata>>} - Promise<Metadata[]>
   */
  async list(directory, recursive) {
    let list = await StorageService.fs.metadata.list();

    if (directory) {
      list = list.filter(metadata => {
        const fileKey = metadata.key;
        const dirKey = directory.key + '/';
        return fileKey.startsWith(dirKey) && (recursive || fileKey.indexOf('/', dirKey.length) === -1);
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
   * @param {Metadata} metadata 
   * @param {ArrayBuffer} data 
   */
  async write(metadata, data) {
    if (data) {
      const content = FileContent.create(metadata.path, data);

      // See what's stored locally already
      const current = await StorageService.fs.metadata.read(metadata.key);
      if (current === undefined || current.hash !== metadata.hash) {
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
    const metadata = await StorageService.fs.metadata.read(path.toLowerCase());
    const keys = [path.toLowerCase()];
    if (metadata.tag === 'folder') {
      const descendents = await this.list(metadata, true);
      descendents.map(m => m.key).forEach(key => keys.push(key));
    }

    await StorageService.fs.metadata.deleteAll(keys);
    await StorageService.fs.content.deleteAll(keys);
    await StorageService.fs.delta.writeAll([FileMetadata.createDeleted(path.toLowerCase())]);
  }

  /**
   * Moves a file
   * @param {string} path 
   * @param {string} destinationPath 
   */
  async move(path, destinationPath) {
    // TODO handle folders
    const source = await StorageService.fs.metadata.read(path.toLowerCase());
    const content = await StorageService.fs.content.read(path.toLowerCase());
    const destination = new FileMetadata().extend(source).path(destinationPath).metadata();
    await this.write(destination, content.data);
    await this.delete(path);
  }
}

const localProvider = new LocalProvider();
export default localProvider;

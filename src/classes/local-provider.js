import DeletedMetadata from './files/deleted-metadata';
import FileContent from './files/file-content';
import FileMetadata from './files/file-metadata';
import FilePath from './files/file-path';
import FolderMetadata from './files/folder-metadata';
import Logger from './logger';
import { StorageService } from '../services';

const log = Logger.get('LocalProvider');

export default class LocalProvider {

  /**
   * Gets an available filename in a given directory
   * @param {Metadata} directory
   * @param {string} name
   * @returns {Promise.<string>}
   */
  async new(directory, name) {
    const existing = await this.list(directory, false);
    let candidate = name;
    let index = 0;
    while (existing.filter(m => m.name === candidate).length > 0) {
      index++;
      const file = FilePath.create(name);
      candidate = `${file.stem} (${index}).${file.extension}`;
    }
    return candidate;
  }

  /**
   * Returns a metadata object
   * @returns {Promise.<Metadata>} - Promise<Metadata>
   */
  async get(path) {
    return await StorageService.fs.metadata.read(path.toLowerCase());
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
    const predicate = directory === undefined ? undefined : (fileKey) => {
      const dirKey = directory.key + '/';
      return fileKey.startsWith(dirKey) && (recursive || fileKey.indexOf('/', dirKey.length) === -1);
    };

    let list = await StorageService.fs.metadata.list(predicate);
    return list;
  }

  /**
   * Returns the file data as an ArrayBuffer
   * @param {string} path
   * @returns {Promise.<ArrayBuffer>} - Promise<ArrayBuffer>
   */
  async read(path) {
    const content = await StorageService.fs.content.read(path.toLowerCase());
    return content === undefined ? new Uint8Array().buffer : content.data;
  }

  /**
   * Writes file data to disk
   * @param {Metadata} metadata 
   * @param {ArrayBuffer} data 
   * @returns {Promise.<boolean>} Whether the file was saved
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
        return true;
      }

      log.debug(`${metadata.key} has not changed`);
      return false;
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
    await StorageService.fs.delta.writeAll([DeletedMetadata.create(path)]);
  }

  /**
   * Moves a file
   * @param {string} sourcePath 
   * @param {string} destinationPath 
   */
  async move(sourcePath, destinationPath) {
    log.debug(`mv ${sourcePath} ${destinationPath}`);
    const source = await StorageService.fs.metadata.read(sourcePath.toLowerCase());
    const destination = await StorageService.fs.metadata.read(destinationPath.toLowerCase());
    if (destination) {
      throw new Error(`${destination.path} already exists`);
    }

    if (source.tag === 'folder') {
      // TODO: Revisit this - move all the files and folders and only create
      // deletion stub for the root dir
      const descendents = await this.list(source);
      await Promise.all(descendents.map(descendent => {
        return this.move(descendent.path, `${destinationPath}/${descendent.name}`);
      }));

      this.mkdir(destinationPath);
      await StorageService.fs.metadata.deleteAll([sourcePath]);
      await StorageService.fs.delta.writeAll([DeletedMetadata.create(sourcePath)]);

    } else {
      const content = await StorageService.fs.content.read(sourcePath.toLowerCase());
      const destination = FileMetadata.create().assign(source).path(destinationPath).value;
      await this.write(destination, content.data);
      await this.delete(sourcePath);  
    }
  }
}

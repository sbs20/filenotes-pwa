import DeletedMetadata from './files/deleted-metadata';
import FileContent from './files/file-content';
import FileMetadata from './files/file-metadata';
import FilePath from './files/file-path';
import FolderMetadata from './files/folder-metadata';
import Logger from './logger';
import Storage from './data/storage';

const storage = Storage.instance();
const log = Logger.get('LocalProvider');
let provider = null;

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
    while (existing.filter(m => m.name.toLowerCase() === candidate.toLowerCase()).length > 0) {
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
    if (path === '') {
      return FolderMetadata.create('');
    }
    return await storage.fs.metadata.read(path.toLowerCase());
  }

  /**
   * Creates a local directory
   * @param {string} path
   * @returns {Promise.<void>}
   */
  async mkdir(path) {
    const metadata = FolderMetadata.create(path);
    await storage.fs.metadata.writeAll([metadata]);
    await storage.fs.delta.writeAll([metadata]);    
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

    let list = await storage.fs.metadata.list(predicate);
    return list;
  }

  /**
   * Returns a list of file metadata objects
   * @param {string|RegExp} [query]
   * @param {Metadata} [directory]
   * @param {boolean} [recursive]
   * @returns {Promise.<Array.<Metadata>>} - Promise<Metadata[]>
   */
  async search(query, directory, recursive) {
    if (typeof(query) === 'string') {
      query = new RegExp(query, 'i');
    }

    const index = {};
    const searchable = {};
    const results = [];
    (await this.list(directory, recursive)).forEach(m => {
      index[m.key] = m;
      if (m.name.match(query)) {
        results.push(m);
      } else if (FilePath.create(m.path).type === 'text') {
        searchable[m.key] = true;
      }
    });

    await storage.fs.content.list((key, content) => {
      if (key in searchable) {
        const text = Buffer.from(content.data).toString();
        if (text.match(query)) {
          results.push(index[key]);
        }  
      }
      return false;
    });

    return results;
  }

  /**
   * Returns the file data as an ArrayBuffer
   * @param {string} path
   * @returns {Promise.<ArrayBuffer>} - Promise<ArrayBuffer>
   */
  async read(path) {
    const content = await storage.fs.content.read(path.toLowerCase());
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
      const current = await storage.fs.metadata.read(metadata.key);
      if (current === undefined || current.hash !== metadata.hash) {
        log.debug(`${metadata.key} has changed`);
        await storage.fs.metadata.writeAll([metadata]);
        await storage.fs.content.writeAll([content]);
        await storage.fs.delta.writeAll([metadata]);
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
    const metadata = await storage.fs.metadata.read(path.toLowerCase());
    const keys = [path.toLowerCase()];
    if (metadata.tag === 'folder') {
      const descendents = await this.list(metadata, true);
      descendents.map(m => m.key).forEach(key => keys.push(key));
    }

    await storage.fs.metadata.deleteAll(keys);
    await storage.fs.content.deleteAll(keys);
    await storage.fs.delta.writeAll([DeletedMetadata.create(path)]);
    keys.forEach(key => log.info(`rm ${key}`));
  }

  /**
   * Moves a file
   * @param {string} sourcePath 
   * @param {string} destinationPath 
   */
  async move(sourcePath, destinationPath) {
    log.debug(`mv ${sourcePath} ${destinationPath}`);
    const source = await storage.fs.metadata.read(sourcePath.toLowerCase());
    const destination = await storage.fs.metadata.read(destinationPath.toLowerCase());
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
      await storage.fs.metadata.deleteAll([sourcePath]);
      await storage.fs.delta.writeAll([DeletedMetadata.create(sourcePath)]);

    } else {
      const content = await storage.fs.content.read(sourcePath.toLowerCase());
      const destination = FileMetadata.create().assign(source).path(destinationPath).value;
      await this.write(destination, content.data);
      await this.delete(sourcePath);  
    }
  }

  /**
   * @returns {LocalProvider}
   */
  static instance() {
    if (provider === null) {
      provider = new LocalProvider();
    }
    return provider;
  }
}

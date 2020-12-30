import FileBuilder from './files/file-builder';
import FilePath from './files/file-path';
import Logger from './logger';
import Storage from './data/storage';

const storage = Storage.instance();
const log = Logger.get('LocalProvider');
let provider: LocalProvider | null = null;

export default class LocalProvider {
  /**
   * Gets an available filename in a given directory
   */
  async new(directory: Metadata, name: string): Promise<string> {
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
   */
  async get(path: string): Promise<Metadata> {
    if (path === '') {
      return FileBuilder.folder('');
    }
    return await storage.fs.metadata.read(path.toLowerCase());
  }

  /**
   * Creates a local directory
   */
  async mkdir(path: string): Promise<void> {
    const metadata = FileBuilder.folder(path);
    await storage.fs.metadata.writeAll([metadata]);
    await storage.fs.delta.writeAll([metadata]);    
  }

  /**
   * Returns a list of file metadata objects
   */
  async list(directory?: Metadata, recursive?: boolean): Promise<Metadata[]> {
    if (directory) {
      return await storage.fs.metadata.list((fileKey) => {
        const dirKey = directory.key + '/';
        return fileKey.startsWith(dirKey) && (recursive || fileKey.indexOf('/', dirKey.length) === -1);
      });
    }

    return await storage.fs.metadata.list();
  }

  /**
   * Returns a list of file metadata objects
   */
  async search(query: string | RegExp, directory?: Metadata, recursive?: boolean): Promise<Metadata[]> {
    if (typeof query === 'string') {
      query = new RegExp(query, 'i');
    }

    const index: Dictionary<Metadata> = {};
    const searchable: Dictionary<boolean> = {};
    const results: Metadata[] = [];
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
   */
  async read(path: string): Promise<ArrayBuffer> {
    const content = await storage.fs.content.read(path.toLowerCase());
    return content === undefined ? new Uint8Array().buffer : content.data;
  }

  /**
   * Writes file data to disk
   */
  async write(metadata: Metadata, data: ArrayBuffer): Promise<boolean> {
    if (metadata === undefined) {
      throw new Error('Metadata is undefined');
    }
    if (metadata.name && metadata.name.trim().length === 0) {
      throw new Error('Metadata must have a name');
    }

    if (data) {
      const content = FileBuilder.content(metadata.path, data);

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
    }
    return false;
  }

  /**
   * Delete a file
   */
  async delete(path: string): Promise<void> {
    const metadata = await storage.fs.metadata.read(path.toLowerCase());
    const keys = [path.toLowerCase()];
    if (metadata.tag === 'folder') {
      const descendents = await this.list(metadata, true);
      descendents.map(m => m.key).forEach(key => keys.push(key));
    }

    await storage.fs.metadata.deleteAll(keys);
    await storage.fs.content.deleteAll(keys);
    await storage.fs.delta.writeAll([FileBuilder.deleted(path)]);
    keys.forEach(key => log.info(`rm ${key}`));
  }

  /**
   * Moves a file
   */
  async move(sourcePath: string, destinationPath: string): Promise<void> {
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
      await storage.fs.delta.writeAll([FileBuilder.deleted(sourcePath)]);

    } else {
      const content = await storage.fs.content.read(sourcePath.toLowerCase());
      const destination = FileBuilder.path(source, destinationPath);
      await this.write(destination, content.data);
      await this.delete(sourcePath);  
    }
  }

  /**
   * @returns {LocalProvider}
   */
  static instance(): LocalProvider {
    if (provider === null) {
      provider = new LocalProvider();
    }
    return provider;
  }
}

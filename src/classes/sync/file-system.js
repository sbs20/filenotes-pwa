import FileMetadata from '../files/file-metadata';
import { StorageService } from '../service';

export default class FileSystem {
  /**
   * Returns a metadata object
   * @returns {Promise.<Metadata>} - Promise<Metadata>
   */
  async get(path) {
    return await StorageService.fs.metadata.read(path);
  }

  /**
   * Returns a list of changed file metadata objects
   * @returns {Promise.<Array.<Metadata>>} - Promise<Metadata[]>
   */
  async deltas() {
    return await StorageService.fs.delta.list();
  }

  /**
   * Clear all deltas
   */
  async clearDeltas() {
    return await StorageService.fs.delta.clear();
  }

  /**
   * Returns a list of file metadata objects
   * @returns {Promise.<Array.<Metadata>>} - Promise<Metadata[]>
   */
  async list() {
    return await StorageService.fs.metadata.list();
  }

  /**
   * Returns a list of file metadata objects
   * @returns {Promise.<Array.<Metadata>>} - Promise<Metadata[]>
   */
  async listWithoutContent() {
    const content = (await StorageService.fs.content.keys())
      .reduce((output, key) => {
        output[key] = true;
        return output;
      }, {});

    const list = (await this.list())
      .filter(metadata => metadata.tag === 'file' && !(metadata.key in content))
      .map(metadata => metadata.key);

    return list;
  }

  /**
   * Returns the file data as an ArrayBuffer
   * @param {string} path
   * @returns {Promise.<ArrayBuffer>} - Promise<ArrayBuffer>
   */
  async read(path) {
    const content = await StorageService.fs.content.read(path);
    return content.data;
  }

  /**
   * Writes all metadata objects, clears the associated content and does not write deltas
   * @param {Array.<Metadata>} metadatas - The list of metadata objects to write
   */
  async write(metadatas) {
    await StorageService.fs.metadata.writeAll(metadatas);
    await StorageService.fs.content.deleteAll(metadatas.map(metadata => metadata.key));
  }

  /**
   * Writes all content objects
   * @param {Array.<Content>} content - The list of content objects to write
   */
  async writeContent(contents) {
    await StorageService.fs.content.writeAll(contents);
  }

  /**
   * Delete a list of files
   * @param {Array.<string>} paths - The path of the file to delete
   * @returns {Promise.<void>}
   */
  async delete(paths) {
    await StorageService.fs.metadata.deleteAll(paths.map(path => path.toLowerCase()));
    await StorageService.fs.content.deleteAll(paths.map(path => path.toLowerCase()));
    await StorageService.fs.delta.deleteAll(paths.map(path => path.toLowerCase()));
  }

  /**
   * Moves a file
   * @param {string} path - The path of the file to move
   * @param {string} destinationPath - The destination path
   * @returns {Promise.<Metadata>} - The destination Metadata
   */
  async move(path, destinationPath) {
    const source = await StorageService.fs.metadata.read(path.toLowerCase());
    const content = await StorageService.fs.content.read(path.toLowerCase());  
    const destination = new FileMetadata().extend(source).path(destinationPath).metadata();
    
    await StorageService.fs.metadata.writeAll([destination]);
    await StorageService.fs.delta.writeAll([destination]);
    if (content) {
      content.key = destinationPath.toLowerCase();
      await StorageService.fs.content.writeAll([content]);  
    }
    await this.delete([path]);
    return destination;
  }
}

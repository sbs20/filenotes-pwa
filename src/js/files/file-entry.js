import Convert from '../convert';
import FilePath from './file-path';
import hash from '../hashing-service';

export default class FileEntry {
  /**
   * Clone the metadata
   * @param {Metadata} metadata
   * @returns {Metadata}
   */
  static clone(metadata) {
    const clone = {};
    if (metadata) {
      for (const property in metadata) {
        clone[property] = metadata[property];
      }
    }
    return clone;
  }

  /**
   * Updates the modified date
   * @param {Metadata} metadata 
   * @returns {Metadata}
   */
  static updateModified(metadata) {
    metadata.modified = new Date().toISOString();
    return metadata;
  }

  /**
   * Updates the path, key, name and modified date
   * @param {Metadata} metadata 
   * @param {string} path
   * @returns {Metadata} 
   */
  static updatePath(metadata, path) {
    const filepath = new FilePath(path);
    metadata.path = path;
    metadata.key = filepath.key;
    metadata.name = filepath.name;
    return this.updateModified(metadata);
  }

  /**
   * @param {Metadata} metadata 
   * @param {ArrayBuffer} data
   * @returns {Promise.<Metadata>}
   */
  static async updateData(metadata, data) {
    metadata.size = data.byteLength;
    metadata.hash = await hash(data);
    return this.updateModified(metadata);
  }

  /**
   * Creates a new metadata
   * @param {string} path - The path
   * @param {ArrayBuffer} data - The data
   * @returns {Promise.<Metadata>}
   */
  static async createFileMetadata(path, data) {
    /** @type {Metadata} */
    const metadata = {
      tag: 'file'
    };

    this.updatePath(metadata, path);
    await this.updateData(metadata, data);
    return metadata;
  }

  /**
   * Creates a deletion stub
   * @param {string} path - The path
   * @returns {Metadata}
   */
  static createDeletedMetadata(path) {
    return this.updatePath({
      tag: 'file'
    }, path);
  }

  /**
   * Creates a moved metadata
   * @param {Metadata} metadata 
   * @param {string} destinationPath 
   * @returns {Metadata}
   */
  static moved(metadata, destinationPath) {
    return this.updatePath(this.clone(metadata), destinationPath);
  }

  /**
   * 
   * @param {string} key 
   * @param {ArrayBuffer} data 
   * @returns {Content}
   */
  static createContent(key, data) {
    /** @type {Content} */
    const content = {
      key: key,
      data: data
    };

    if (FilePath.create(key).extension === 'txt') {
      content.preview = Convert.arrayBufferToString(data).substr(0, 50);
    }

    return content;
  }
}
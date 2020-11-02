import FilePath from './file-path';
import hash from '../hashing-service';

const _metadata = Symbol();

export default class FileMetadata {

  /**
   * Constructor
   */
  constructor() {
    /** @type {Metadata} */
    this[_metadata] = {
      tag: 'file'
    };
  }

  /**
   * @param {Metadata} [metadata]
   * @returns {FileMetadata}
   */
  extend(metadata) {
    if (metadata) {
      for (const property in metadata) {
        this[_metadata][property] = metadata[property];
      }
    }
    return this;
  }

  /**
   * Updates the path and associated members
   * @param {string} path - The filepath
   * @returns {FileMetadata}
   */
  path(path) {
    const filepath = new FilePath(path);
    return this.extend({
      path: path,
      key: filepath.key,
      name: filepath.name,
      modified: new Date().toISOString()
    });
  }

  /**
   * @param {ArrayBuffer} data
   * @returns {Promise.<FileMetadata>}
   */
  async data(data) {
    return this.extend({
      size: data.byteLength,
      hash: await hash(data),
      modified: new Date().toISOString()
    });
  }

  /**
   * @returns {Metadata}
   */
  metadata() {
    return this[_metadata];
  }

  /**
   * Creates a new metadata
   * @param {string} path - The path
   * @param {ArrayBuffer} data - The data
   * @returns {Promise.<Metadata>}
   */
  static async create(path, data) {
    const file = new FileMetadata().path(path);
    await file.data(data);
    return file.metadata();
  }

  /**
   * Creates a deletion stub
   * @param {string} path - The path
   * @returns {Metadata}
   */
  static createDeleted(path) {
    return new FileMetadata().extend({
      tag: 'deleted'
    }).path(path).metadata();
  }
}
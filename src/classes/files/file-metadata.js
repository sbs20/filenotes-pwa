import FilePath from './file-path';
import { Hasher } from '../../services';

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
   * @returns {FileMetadata}
   */
  data(data) {
    return this.extend({
      size: data.byteLength,
      hash: Hasher.hash(data),
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
   * @returns {Metadata}
   */
  static create(path, data) {
    // TODO: REMOVE THIS
    return new FileMetadata().path(path).data(data).metadata();
  }

  /**
   * Creates a new metadata
   * @param {Metadata} metadata - The metadata
   * @param {ArrayBuffer} data - The data
   * @returns {Metadata}
   */
  static from(metadata, data) {
    const file = new FileMetadata().extend(metadata);
    if (data) {
      file.data(data);
    }
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
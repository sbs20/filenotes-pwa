import FilePath from './file-path';

const _metadata = Symbol();

export default class FolderMetadata {
  /**
   * Constructor
   */
  constructor() {
    /** @type {Metadata} */
    this[_metadata] = {
      tag: 'folder'
    };
  }

  /**
   * @param {Metadata} [metadata]
   * @returns {FolderMetadata}
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
      name: filepath.name
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
  static create(path) {
    return new FolderMetadata().path(path).metadata();
  }

  /**
   * Creates a deletion stub
   * @param {string} path - The path
   * @returns {Metadata}
   */
  static createDeleted(path) {
    return new FolderMetadata().extend({
      tag: 'deleted'
    }).path(path).metadata();
  }
}
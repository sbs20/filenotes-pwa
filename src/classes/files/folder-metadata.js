import BaseMetadata from './base-metadata';
import FilePath from './file-path';

export default class FolderMetadata extends BaseMetadata {
  /**
   * Constructor
   */
  constructor() {
    super();
    this.assign({
      tag: 'folder'
    });
  }

  /**
   * Returns the value
   * @returns {Metadata}
   */
  get value() {
    return super.value;
  }

  /**
   * Updates the path and associated members
   * @param {string} path - The filepath
   * @returns {FolderMetadata}
   */
  path(path) {
    const filepath = new FilePath(path);
    this.assign({
      path: path,
      key: filepath.key,
      name: filepath.name
    });
    return this;
  }

  /**
   * Creates a new metadata
   * @param {string} path - The path
   * @param {ArrayBuffer} data - The data
   * @returns {Metadata}
   */
  static create(path) {
    return new FolderMetadata().path(path).value;
  }
}
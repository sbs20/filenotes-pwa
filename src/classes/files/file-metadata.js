import BaseMetadata from './base-metadata';
import FilePath from './file-path';
import { Hasher } from '../../services';

export default class FileMetadata extends BaseMetadata {

  /**
   * Constructor
   */
  constructor() {
    super();
    this.assign({
      tag: 'file'
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
   * @returns {FileMetadata}
   */
  path(path) {
    const filepath = new FilePath(path);
    return this.assign({
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
    return this.assign({
      size: data.byteLength,
      hash: Hasher.hash(data),
      modified: new Date().toISOString()
    });
  }

  /**
   * Creates a new FileMetadata
   * @param {string} path - The path
   * @param {ArrayBuffer} data - The data
   * @returns {FileMetadata}
   */
  static create() {
    return new FileMetadata();
  }
}
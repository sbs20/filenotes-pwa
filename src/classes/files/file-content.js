import Convert from '../utils/convert';
import BaseMetadata from './base-metadata';
import FilePath from './file-path';

export default class FileContent extends BaseMetadata {
  constructor() {
    super();
  }

  /**
   * Returns the value
   * @returns {Content}
   */
  get value() {
    return super.value;
  }

  /**
   * Updates the key
   * @param {string} key - The filepath
   * @returns {FileContent}
   */
  key(key) {
    return this.assign({
      key: key.toLowerCase()
    });
  }

  /**
   * Updates the data
   * @param {ArrayBuffer} data - The data
   * @returns {FileContent}
   */
  data(data) {
    const extension = {
      data: data      
    };

    if (FilePath.create(this.value.key).extension === 'txt') {
      extension.preview = Convert.arrayBufferToString(data).substr(0, 50);
    }

    return this.assign(extension);
  }

  /**
   * 
   * @param {string} key 
   * @param {ArrayBuffer} data 
   * @returns {Content}
   */
  static create(key, data) {
    return new FileContent().key(key).data(data).value;
  }
}
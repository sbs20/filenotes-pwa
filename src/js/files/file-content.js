import Convert from "../convert";
import FilePath from "./file-path";

const _content = Symbol();

export default class FileContent {
  constructor() {
    /** @type {Content} */
    this[_content] = {};   
  }

  /**
   * @param {Content} [content] 
   * @returns {FileContent}
   */
  extend(content) {
    if (content) {
      for (const property in content) {
        this[_content][property] = content[property];
      }
    }
    return this;
  }

  /**
   * Updates the key
   * @param {string} key - The filepath
   * @returns {FileContent}
   */
  key(key) {
    return this.extend({
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

    if (FilePath.create(this.key).extension === 'txt') {
      extension.preview = Convert.arrayBufferToString(data).substr(0, 50);
    }

    return this.extend(extension);
  }

  /**
   * @returns {Content}
   */
  content() {
    return this[_content];
  }

  /**
   * 
   * @param {string} key 
   * @param {ArrayBuffer} data 
   * @returns {Content}
   */
  static create(key, data) {
    return new FileContent().key(key).data(data).content();
  }
}
import GenericStore from './generic-store';

export default class FileStore extends GenericStore {
  /**
   * Returns a list of file metadata objects
   * @param {function(string, Metadata):boolean} [predicate]
   * @returns {Promise.<Array.<Metadata>>} Promise<Metadata[]>
   */
  async list(predicate) {
    return await super.list(predicate);
  }

  /**
   * Returns a file metadata object
   * @param {string} key - The metadata.key
   * @returns {Promise.<Metadata>} Promise<Metadata>
   */
  async read(key) {
    return await super.read(key);
  }

  /**
   * Writes a list of metadata items
   * @param {Array.<Metadata>} items - The items to write
   * @returns {Promise.<void>} Promise<void>
   */
  async writeAll(items) {
    await super.writeAll(items);
  }
}

import FileStore from './file-store';

export default class ContentStore extends FileStore {
  /**
   * Returns a list of file content objects
   * @param {function(string, Content):boolean} [predicate]
   * @returns {Promise.<Array.<Content>>} Promise<Content[]>
   */
  async list(predicate) {
    return await super.list(predicate);
  }

  /**
   * Returns a file content object
   * @param {string} key - The metadata.key
   * @returns {Promise.<Content>} Promise<Content>
   */
  async read(key) {
    return await super.read(key);
  }

  /**
   * Writes a list of content items
   * @param {Array.<Content>} items - The items to write
   * @returns {Promise.<void>} Promise<void>
   */
  async writeAll(items) {
    await super.writeAll(items);
  }
}

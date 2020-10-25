/* eslint-disable no-unused-vars */
export default class FileProvider {

  /**
   * @returns {Promise.<Array.<Metadata>>}
   */
  async list() {}

  async read(path) {}

  async move(file, desiredPath) {}
  async delete(path) {}
  async write(file) {}

  /*void*/ progress(/*string*/ filepath, /*Number*/ filesize, /*Number*/ bytes, /*Date*/ start) {}
}

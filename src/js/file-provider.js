/* eslint-disable no-unused-vars */
export default class FileProvider {

    /**
     * 
     * @param {string} path
     * @returns {Promise()} 
     */
    async select(/*string*/ path) {}
    
    async list() {}
    async read(path) {}

    async move(file, desiredPath) {}
    async delete(path) {}
    async write(file) {}

    /*void*/ progress(/*string*/ filepath, /*Number*/ filesize, /*Number*/ bytes, /*Date*/ start) {}
}

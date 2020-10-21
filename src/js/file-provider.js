/* eslint-disable no-unused-vars */
export default class FileProvider {

    /**
     * 
     * @param {string} path
     * @returns {Promise()} 
     */
    async select(/*string*/ path) {}
    
    async list() {}

    /*Promise(void)*/ async move(/*file*/ file, /*string*/ desiredPath) {}
    /*Promise(void)*/ async delete(/*string*/ path) {}
    /*Promise(void)*/ async write(/*file*/ file) {}
    /*Promise(Buffer)*/ async read(/*string*/ path) {}

    /*void*/ progress(/*string*/ filepath, /*Number*/ filesize, /*Number*/ bytes, /*Date*/ start) {}
}

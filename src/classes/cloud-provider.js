/* eslint-disable no-unused-vars */
export default class CloudProvider {
  constructor() {
    this.options = {
      clientId: ''
    };
    this.accountEmail = '';
    this.connected = false;    
  }

  /**
   * Apply options
   * @param {Object} options 
   */
  configure(options) {
    if (this.options === null) {
      this.options = {};
    }
    for (const property in options) {
      this.options[property] = options[property];
    }
  }
  
  async connect() {}

  authenticationUrl() {}

  authenticationToken(uriHash) {}

  async list() {
    throw new Error('list() not implemented');
  }

  async get(path) {
    throw new Error('get() not implemented');
  }

  async read(path) {
    throw new Error('read() not implemented');
  }

  async move(file, desiredPath) {
    throw new Error('move() not implemented');
  }

  async delete(path) {
    throw new Error('delete() not implemented');
  }

  async write(file) {
    throw new Error('write() not implemented');
  }
}

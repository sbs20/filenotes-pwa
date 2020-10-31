import FileProvider from './file-provider';
/* eslint-disable no-unused-vars */
export default class CloudService extends FileProvider {
  constructor() {
    super();
    this.options = {
      clientId: ''
    };
    this.currentAccountEmail = '';
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

  async hash(buffer) {}
}

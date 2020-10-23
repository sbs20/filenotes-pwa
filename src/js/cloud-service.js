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

  configure(options) {
    this.options = options;
  }
  
  async connect() {}

  authenticationUrl() {}

  authenticationToken(uriHash) {}
}

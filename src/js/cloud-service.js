import FileProvider from './file-provider';
/* eslint-disable no-unused-vars */
export default class CloudService extends FileProvider {
  constructor() {
    super();
    this.currentAccountEmail = '';
    this.isAuthorised = false;    
  }

  async connect() {}

  asRemote(metadata) {
    return metadata;
  }
  
  asLocal(metadata) {
    return metadata;
  }

  startAuthorisation() {}

  finishAuthorisation(uri) {}
}

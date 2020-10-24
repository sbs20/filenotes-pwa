import FileProvider from './file-provider';
import Storage from './storage';

export default class LocalProvider extends FileProvider {  
  async list() {
    return await Storage.fs.metadata.list();
  }

  async read(path) {
    return await Storage.fs.content.read(path);
  }
}

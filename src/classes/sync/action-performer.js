import FileContent from '../files/file-content';
import Log from '../log';
import RemoteProvider from '../remote-provider';
import FileSystem from './file-system';

const fs = new FileSystem();
const log = Log.get('sync-engine');

export default class ActionPerformer {
  /**
   * 
   * @param {SyncAction} action 
   */
  static async perform(action) {
    const key = action.metadata.key;
    switch (action.type) {
      case 'file-download': {
        const buffer = await RemoteProvider.read(key);
        const content = FileContent.create(key, buffer);
        await fs.write([action.metadata]);
        await fs.writeContent([content]);  
        log.debug(`downloaded ${key}`);
        break;
      }

      case 'file-upload': {
        const buffer = await fs.read(key);
        const response = await RemoteProvider.write(action.metadata, buffer);
        log.debug(`uploaded ${key}`, response);
        break;
      }
  
      case 'mkdir-local':
        await fs.write([action.metadata]);
        log.debug(`created local directory ${key}`);
        break;

      case 'mkdir-remote':
        await RemoteProvider.mkdir(action.metadata.path);
        log.debug(`created remote directory ${key}`);
        break;

      case 'delete-local':
        await fs.delete([key]);
        log.debug(`deleted local file ${key}`);
        break;

      case 'delete-remote':
        await RemoteProvider.delete(action.metadata.path);
        log.debug(`deleted remote file ${key}`);
        break;

      default:
        log.error(`Unknown action type: ${action.type}`);
    }
  }
}
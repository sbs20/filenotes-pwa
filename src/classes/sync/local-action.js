import FileContent from '../files/file-content';
import Log from '../log';
import RemoteProvider from '../remote-provider';
import { StorageService } from '../service';

const log = Log.get('sync.local');

export default class LocalAction {

  /**
   * Applies a metadata to the local filesystem
   * @param {Metadata} metadata
   * @returns {Promise.<void>}
   */
  static async perform(metadata) {
    switch (metadata.tag) {
      case 'file': {
        const local = await StorageService.fs.metadata.read(metadata.key);
        if (local === undefined || metadata.hash !== local.hash) {
          const buffer = await RemoteProvider.read(metadata.key);
          const content = FileContent.create(metadata.key, buffer);
          await StorageService.fs.content.writeAll([content]);   
          await StorageService.fs.metadata.writeAll([metadata]);
          log.info(`downloaded: ${metadata.key}`);
        } else if (metadata.revision !== local.revision) {
          await StorageService.fs.metadata.writeAll([metadata]);
          log.debug(`revision update: ${metadata.key}`);
        } else {
          log.debug(`no change: ${metadata.key}`);
        }
        break;
      }

      case 'folder':
        await StorageService.fs.metadata.writeAll([metadata]);
        log.info(`created local directory: ${metadata.key}`);
        break;

      case 'deleted':
        await StorageService.fs.metadata.deleteAll([metadata.key]);
        await StorageService.fs.content.deleteAll([metadata.key]);        
        log.info(`deleted local entry: ${metadata.key}`);
        break;

      default:
        log.error(`Unknown tag: ${metadata.tag}`);
    }
  }
}
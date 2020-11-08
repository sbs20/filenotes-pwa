import Log from '../log';
import RemoteProvider from '../remote-provider';
import { StorageService } from '../service';

const log = Log.get('sync-engine');

export default class RemoteAction {
  /**
   * Applies a metadata
   * @param {Metadata} metadata
   * @returns {Promise.<void>}
   */
  static async perform(metadata) {
    switch (metadata.tag) {
      case 'file': {
        /** @type {Content} */
        const content = await StorageService.fs.content.read(metadata.key);
        const response = await RemoteProvider.write(metadata, content.data);
        if (response.key === metadata.key) {
          // Write the response in order to get the revision update
          await StorageService.fs.metadata.writeAll([response]);
          log.info(`uploaded file: ${metadata.key}`);
        } else {
          // Write metadata and content to new locations
          await StorageService.fs.metadata.writeAll([response]);
          content.key = response.key;
          await StorageService.fs.content.writeAll([content]);
          // Delete the old locations
          await StorageService.fs.metadata.deleteAll([metadata.key]);
          await StorageService.fs.content.deleteAll([metadata.key]);
          log.info(`uploaded conflict: ${metadata.key} as ${response.key}`);
        }
        break;
      }
  
      case 'folder':
        await RemoteProvider.mkdir(metadata.path);
        log.info(`created remote directory: ${metadata.key}`);
        break;

      case 'deleted':
        try {
          await RemoteProvider.delete(metadata.path);
          log.info(`deleted remote file: ${metadata.key}`);  
        } catch (exception) {
          // If it's already been deleted we can ignore it
          if (exception.error.indexOf('path_lookup/not_found') === -1) {
            throw exception;
          }
        }
        break;

      default:
        log.error(`Unknown tag: ${metadata.tag}`);
    }

    // If we got here we can delete the local delta
    await StorageService.fs.delta.deleteAll([metadata.key]);
  }
}
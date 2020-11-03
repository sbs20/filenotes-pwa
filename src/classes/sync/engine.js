import Log from '../log';
import RemoteProvider from '../remote-provider';
import { StorageService } from '../service';
import ActionBuilder from './action-builder';
import ActionPerformer from './action-performer';
import FileSystem from './file-system';

const fs = new FileSystem();
const log = Log.get('sync-engine');

export default class SyncEngine {
  constructor() {
  }

  async execute() {
    log.info('Start');
    const cursor = await StorageService.settings.get('remoteCursor');
    RemoteProvider.cursor = cursor;

    try {
      const localFiles = await fs.list();
      const localDeltas = await fs.deltas();
      const remoteDeltas = await RemoteProvider.list();

      const actions = await ActionBuilder.build(localFiles, localDeltas, remoteDeltas);
      log.debug('actions', actions);
      await Promise.all(actions.map(action => ActionPerformer.perform(action)));
      await fs.clearDeltas();
      await StorageService.settings.set('remoteCursor', RemoteProvider.cursor);
      await this.downloadMissingContent();  
      log.debug('finished sync');
    } catch (error) {
      log.error('Sync error occurred', error);
    }
  }

  async downloadMissingContent() {
    const queue = await fs.listWithoutContent();
    if (queue.length > 0) {
      log.debug('content queue', queue);
      await Promise.all(queue.map(metadata =>
        ActionPerformer.perform({ type: 'file-download', metadata: metadata })));  
    }
  }
}

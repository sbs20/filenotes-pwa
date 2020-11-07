import Log from '../log';
import RemoteProvider from '../remote-provider';
import { StorageService } from '../service';
import LocalAction from './local-action';
import RemoteAction from './remote-action';

const log = Log.get('sync-engine');

async function deltas() {
  const deltas = await StorageService.fs.delta.list();
    
  const sorted = [];
  deltas.filter(m => m.tag === 'deleted').sort((m1, m2) => m2.key.length - m1.key.length).forEach(m => sorted.push(m));
  deltas.filter(m => m.tag === 'folder').sort((m1, m2) => m1.key.length - m2.key.length).forEach(m => sorted.push(m));
  deltas.filter(m => m.tag === 'file').forEach(m => sorted.push(m));
  return sorted;
}

export default class SyncEngine {
  constructor() {
  }

  async execute() {
    log.info('Start');
    const cursor = await StorageService.settings.get('remoteCursor');
    RemoteProvider.cursor = cursor;

    try {
      const localDeltas = await deltas();
      await Promise.all(localDeltas.map(metadata => RemoteAction.perform(metadata)));

      const remoteDeltas = await RemoteProvider.list();
      await Promise.all(remoteDeltas.map(metadata => LocalAction.perform(metadata)));

      await StorageService.settings.set('remoteCursor', RemoteProvider.cursor);
      log.debug('finished sync');
    } catch (error) {
      log.error('Sync error occurred', error);
      throw error;
    }
  }
}

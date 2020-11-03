import FileContent from '../files/file-content';
import FilePath from '../files/file-path';
import Log from '../log';
import RemoteProvider from '../remote-provider';
import { StorageService } from '../service';
import SyncFilesystem from './file-system';

const fs = new SyncFilesystem();
const log = Log.get('sync-engine');

export default class SyncEngine {
  constructor() {
  }

  /**
   * 
   * @param {Metadata} local 
   * @param {Metadata} remote 
   * @returns {Promise.<Array.<SyncAction>>}
   */
  async createActions(local, remote) {
    if (local && remote === undefined) {
      if (local.tag !== 'deleted') {
        return [{ type: 'upload', metadata: local }];
      }
      return [];
    } else if (local === undefined && remote) {
      if (remote.tag !== 'deleted') {
        return [{ type: 'download', metadata: remote }];
      }
      return [];
    } else if (local.tag === 'deleted' && remote.tag === 'deleted') {
      return [];

    } else if (local.tag === 'deleted') {
      return [{ type: 'download', metadata: remote }];

    } else if (remote.tag === 'deleted') {
      return [{ type: 'upload', metadata: local }];

    } else if (local.tag === 'folder' && remote.tag === 'folder') {
      return [];

    } else if (local.tag === 'folder') {
      // There is a file with the same name as a folder. Rename the file
      return [];

    } else if (remote.tag === 'folder') {
      // There is a file with the same name as a folder. Rename the file
      return [];

    } else if (local.hash === remote.hash) {
      return [];

    } else {
      // File conflict. Rename local
      const filepath = new FilePath(local.path);
      const destinationPath = `${filepath.directory}/${filepath.stem}.${Date.now()}.conflict.${filepath.extension}`;
      const destination = await fs.move(local.path, destinationPath);
      return [
        { type: 'download', metadata: remote },
        { type: 'upload', metadata: destination }  
      ];
    }
  }

  /**
   * Resolves all actions to take
   * @returns {Promise.<Array.<SyncAction>>}
   */
  async buildSyncActions() {
    const outgoing = RemoteProvider.cursor ? await fs.deltas() : await fs.list();
    const incoming = await RemoteProvider.list();

    /** @type {Object.<string, {local: Metadata, remote: Metadata}>} */
    const join = {};

    outgoing.forEach(metadata => {
      join[metadata.key] = {
        local: metadata,
        remote: undefined
      };
    });

    incoming.forEach(metadata => {
      if (metadata.key in join) {
        join[metadata.key].remote = metadata;
      } else {
        join[metadata.key] = {
          local: undefined,
          remote: metadata
        };
      }
    });

    /** @type {Array.<SyncAction>} */
    const actions = [];
    for (const key in join) {
      const item = join[key];
      const itemActions = await this.createActions(item.local, item.remote);
      itemActions.forEach(action => actions.push(action));
    }

    return actions;
  }

  /**
   * 
   * @param {SyncAction} action 
   */
  async performAction(action) {
    const key = action.metadata.key;
    switch (action.type) {
      case 'download':
        if (action.metadata.tag === 'folder') {
          // TODO
        } else {
          const buffer = await RemoteProvider.read(key);
          const content = FileContent.create(key, buffer);
          await fs.write([action.metadata]);
          await fs.writeContent([content]);  
          log.debug('downloaded', key);
        }
        break;

      case 'upload':
        if (action.metadata.tag === 'folder') {
          // TODO
        } else {
          const buffer = await fs.read(key);
          const response = await RemoteProvider.write(action.metadata.path, buffer);
          log.debug('uploaded', response);
        }
        break;
  
      case 'deleteLocal':
        await fs.delete([key]);
        break;

      case 'deleteRemote':
        log.error(`Remote delete not implemented ${key}`);
        break;

      default:
        log.error(`Unknown action type: ${action.type}`);
    }
  }

  async execute() {
    log.info('Start');
    const cursor = await StorageService.settings.get('remoteCursor');
    RemoteProvider.cursor = cursor;

    try {
      const actions = await this.buildSyncActions();
      log.debug('actions', actions);
      await Promise.all(actions.map(action => this.performAction(action)));
      await fs.clearDeltas();
      await StorageService.settings.set('remoteCursor', RemoteProvider.cursor);
      await this.syncContent();  
      log.debug('finished sync');
    } catch (error) {
      log.error('Sync error occurred', error);
    }
  }

  async syncContent() {
    const queue = await fs.listWithoutContent();
    log.debug('content queue', queue);
    await Promise.all(queue.map(metadata => this.performAction({ type: 'download', metadata: metadata })));
  }
}

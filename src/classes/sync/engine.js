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
   * @param {Metadata} delta 
   * @param {Metadata} remote 
   * @returns {Promise.<Array.<SyncAction>>}
   */
  async createActions(local, delta, remote) {
    if (local && remote && local.tag === 'file' && local.hash === remote.hash) {
      return [];
    }
    
    const value = `${delta && delta.tag || 'null'}:${remote && remote.tag || 'null'}`;
    switch (value) {
      case 'deleted:deleted':
        // No action
        return [];

      case 'deleted:file':
        // Prefer downloading
        return [{ type: 'file-download', metadata: remote }];

      case 'deleted:folder':
        // Prefer creating the folder
        return [{ type: 'mkdir-local', metadata: remote }];

      case 'deleted:null':
        // Do delete
        return [{ type: 'delete-remote', metadata: delta }];

      case 'file:deleted':
        // Prefer uploading
        return [{ type: 'file-upload', metadata: delta }];

      case 'file:file': {
        // Rename local and sync both ways
        let filepath = new FilePath(delta.path);
        let destinationPath = `${filepath.directory}/${filepath.stem}.${Date.now()}.conflict.${filepath.extension}`;
        let destination = await fs.move(delta.path, destinationPath);
        return [
          { type: 'file-download', metadata: remote },
          { type: 'file-upload', metadata: destination }  
        ];
      }
      case 'file:folder':
        // There is a file with the same name as a folder. Rename the file
        return [];

      case 'file:null':
        return [{ type: 'file-upload', metadata: delta }];


      case 'folder:deleted':
        // Prefer creating the folder
        return [{ type: 'mkdir-remote', metadata: delta }];

      case 'folder:file':
        // There is a file with the same name as a folder. Rename the file
        return [];
      case 'folder:folder':
        // No action
        return [];

      case 'folder:null':
        return [{ type: 'mkdir-remote', metadata: delta }];

      case 'null:deleted':
        return [{ type: 'delete-local', metadata: remote }];

      case 'null:file':
        return [{ type: 'file-download', metadata: remote }];

      case 'null:folder':
        return [{ type: 'mkdir-local', metadata: remote }];

      case 'null:null':
        // No action
        return [];
    }
  }

  /**
   * Resolves all actions to take
   * @returns {Promise.<Array.<SyncAction>>}
   */
  async buildSyncActions() {
    const list = await fs.list();
    const deltas = await fs.deltas();
    const incoming = await RemoteProvider.list();

    /** @type {Object.<string, {delta: Metadata, local: Metadata, remote: Metadata}>} */
    const join = list.concat(deltas).concat(incoming)
      .reduce((output, metadata) => {
        output[metadata.key] = {};
        return output;
      }, {});

    deltas.forEach(metadata => join[metadata.key].delta = metadata);
    incoming.forEach(metadata => join[metadata.key].remote = metadata);
    list.forEach(metadata => join[metadata.key].local = metadata);

    /** @type {Array.<SyncAction>} */
    const actions = [];
    for (const key in join) {
      const item = join[key];
      const itemActions = await this.createActions(item.local, item.delta, item.remote);
      itemActions.forEach(action => actions.push(action));
    }

    /** @type {Array.<SyncAction>} */
    const sorted = [];
    actions.filter(a => a.type === 'delete-local').forEach(a => sorted.push(a));
    actions.filter(a => a.type === 'delete-remote')
      .sort((a1, a2) => a2.metadata.key.length - a1.metadata.key.length).forEach(a => sorted.push(a));
    actions.filter(a => a.type === 'mkdir-local').forEach(a => sorted.push(a));
    actions.filter(a => a.type === 'mkdir-remote')
      .sort((a1, a2) => a1.metadata.key.length - a2.metadata.key.length).forEach(a => sorted.push(a));
    actions.filter(a => a.type === 'file-download').forEach(a => sorted.push(a));
    actions.filter(a => a.type === 'file-upload').forEach(a => sorted.push(a));

    return sorted;
  }

  /**
   * 
   * @param {SyncAction} action 
   */
  async performAction(action) {
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
        const response = await RemoteProvider.write(action.metadata.path, buffer);
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
    if (queue.length > 0) {
      log.debug('content queue', queue);
      await Promise.all(queue.map(metadata => this.performAction({ type: 'file-download', metadata: metadata })));  
    }
  }
}

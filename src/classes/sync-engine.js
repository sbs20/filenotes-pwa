import EventEmitter from './event-emitter';
import FileContent from './files/file-content';

import Log from '../services/log';
import RemoteProvider from '../services/remote-provider';
import StorageService from '../services/storage';

const log = Log.get('sync.engine');

/**
 * @returns {Promise.<Array.<Metadata>>}
 */
async function deltas() {
  const deltas = await StorageService.fs.delta.list();
  const sorted = [];
  deltas.filter(m => m.tag === 'deleted')
    .sort((m1, m2) => m2.key.length - m1.key.length)
    .forEach(m => sorted.push(m));
  deltas.filter(m => m.tag === 'folder')
    .sort((m1, m2) => m1.key.length - m2.key.length)
    .forEach(m => sorted.push(m));
  deltas.filter(m => m.tag === 'file')
    .forEach(m => sorted.push(m));
  return sorted;
}

/**
 * Applies a metadata to the local filesystem
 * @param {Metadata} metadata
 * @returns {Promise.<boolean>}
 */
async function applyLocal(metadata) {
  const local = await StorageService.fs.metadata.read(metadata.key);
  switch (metadata.tag) {
    case 'file': {
      if (local === undefined || metadata.hash !== local.hash) {
        const buffer = await RemoteProvider.read(metadata.key);
        const content = FileContent.create(metadata.key, buffer);
        await StorageService.fs.content.writeAll([content]);   
        await StorageService.fs.metadata.writeAll([metadata]);
        log.info(`downloaded: ${metadata.key}`);
        return true;
      } else if (metadata.revision !== local.revision) {
        await StorageService.fs.metadata.writeAll([metadata]);
        log.debug(`revision update: ${metadata.key}`);
        return true;
      } else {
        log.debug(`no change: ${metadata.key}`);
        return false;
      }
    }

    case 'folder':
      if (local === undefined) {
        await StorageService.fs.metadata.writeAll([metadata]);
        log.info(`created local directory: ${metadata.key}`);
        return true;
      }
      return false;

    case 'deleted':
      if (local !== undefined) {
        await StorageService.fs.metadata.deleteAll([metadata.key]);
        await StorageService.fs.content.deleteAll([metadata.key]);        
        log.info(`deleted local entry: ${metadata.key}`);
        return true;
      }
      return false;

    default:
      log.error(`Unknown tag: ${metadata.tag}`);
      return false;
  }
}

/**
 * Applies a metadata
 * @param {Metadata} metadata
 * @returns {Promise.<boolean>}
 */
async function applyRemote(metadata) {
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
      await RemoteProvider.delete(metadata.path);
      log.info(`deleted remote file: ${metadata.key}`);  
      break;

    default:
      log.error(`Unknown tag: ${metadata.tag}`);
  }

  // If we got here we can delete the local delta
  await StorageService.fs.delta.deleteAll([metadata.key]);
  return true;
}

const active = Symbol();

export default class SyncEngine extends EventEmitter {
  constructor() {
    super();
    this[active] = false;
  }

  get active() {
    return this[active];
  }

  async execute() {
    if (this.active) {
      log.info('Already syncing. Terminating');
      return;
    }

    this[active] = true;
    log.info('Started');
    const cursor = await StorageService.settings.get('cursor');
    RemoteProvider.cursor = cursor;

    try {
      const localDeltas = await deltas();
      const peek = await RemoteProvider.peek();
      const total = localDeltas.length + peek.length;
      const completed = count => {
        return 100 * count * (1 / total);
      };
      let index = 0;

      // Uploads, creates and deletes have rate limiting - await each
      for (const delta of localDeltas) {
        await applyRemote(delta);
        this.emit('progress', {
          value: completed(++index)
        });
      }

      const remoteDeltas = await RemoteProvider.list();
      // There doesn't appear to be rate limiting for downloads
      await Promise.all(remoteDeltas.map(delta => applyLocal(delta).then((update) => {
        if (update) {
          this.emit('progress', {
            value: completed(++index)
          });
        }
      })));

      await StorageService.settings.set('cursor', RemoteProvider.cursor);
      log.info('Finished');
      this[active] = false;
    } catch (error) {
      log.error('Sync error occurred', error);
      this[active] = false;
      throw error;
    }
  }
}

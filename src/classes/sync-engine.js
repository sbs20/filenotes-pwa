import EventEmitter from './event-emitter';
import FileContent from './files/file-content';
import Logger from './logger';
import Storage from './data/storage';

const storage = Storage.instance();
const log = Logger.get('SyncEngine');

/**
 * @returns {Promise.<Array.<Metadata>>}
 */
async function deltas() {
  const deltas = await storage.fs.delta.list();
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

const active = Symbol();

export default class SyncEngine extends EventEmitter {
  /**
   * Constructor
   * @param {DropboxManager} remote 
   */
  constructor(remote) {
    super();
    /** @type {DropboxManager} */
    this.remote = remote;
    this[active] = false;
  }

  /**
   * Applies a metadata to the local filesystem
   * @param {Metadata} metadata
   * @returns {Promise.<boolean>}
   */
  async _applyLocal(metadata) {
    const local = await storage.fs.metadata.read(metadata.key);
    switch (metadata.tag) {
      case 'file': {
        if (local === undefined || metadata.hash !== local.hash) {
          const buffer = await this.remote.read(metadata.key);
          const content = FileContent.create(metadata.key, buffer);
          await storage.fs.content.writeAll([content]);   
          await storage.fs.metadata.writeAll([metadata]);
          log.info(`downloaded: ${metadata.key}`);
          return true;
        } else if (metadata.revision !== local.revision) {
          await storage.fs.metadata.writeAll([metadata]);
          log.debug(`revision update: ${metadata.key}`);
          return true;
        } else {
          log.debug(`no change: ${metadata.key}`);
          return false;
        }
      }

      case 'folder':
        if (local === undefined) {
          await storage.fs.metadata.writeAll([metadata]);
          log.info(`created local directory: ${metadata.key}`);
          return true;
        }
        return false;

      case 'deleted':
        if (local !== undefined) {
          await storage.fs.metadata.deleteAll([metadata.key]);
          await storage.fs.content.deleteAll([metadata.key]);        
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
  async _applyRemote(metadata) {
    switch (metadata.tag) {
      case 'file': {
        /** @type {Content} */
        const content = await storage.fs.content.read(metadata.key);
        const response = await this.remote.write(metadata, content.data);
        if (response.key === metadata.key) {
          // Write the response in order to get the revision update
          await storage.fs.metadata.writeAll([response]);
          log.info(`uploaded file: ${metadata.key}`);
        } else {
          // Write metadata and content to new locations
          await storage.fs.metadata.writeAll([response]);
          content.key = response.key;
          await storage.fs.content.writeAll([content]);
          // Delete the old locations
          await storage.fs.metadata.deleteAll([metadata.key]);
          await storage.fs.content.deleteAll([metadata.key]);
          log.info(`uploaded conflict: ${metadata.key} as ${response.key}`);
        }
        break;
      }

      case 'folder':
        await this.remote.mkdir(metadata.path);
        log.info(`created remote directory: ${metadata.key}`);
        break;

      case 'deleted':
        await this.remote.delete(metadata.path);
        log.info(`deleted remote file: ${metadata.key}`);  
        break;

      default:
        log.error(`Unknown tag: ${metadata.tag}`);
    }

    // If we got here we can delete the local delta
    await storage.fs.delta.deleteAll([metadata.key]);
    return true;
  }

  /**
   * @returns {boolean}
   */
  get active() {
    return this[active];
  }

  /**
   * @returns {Promise.<boolean>}
   */
  async isRequired() {
    if (this.active) {
      log.debug('Currently syncing.');
      return false;
    }

    try {
      this[active] = true;
      const localDeltas = await deltas();
      const peek = await this.remote.peek();
      const total = localDeltas.length + peek.length;
      this[active] = false;
      return total > 0;
    } catch (error) {
      log.error('Unable to reach server', error);
      this[active] = false;
      throw error;
    }
  }

  /**
   * @returns {Promise.<void>}
   */
  async execute() {
    if (!this.remote) {
      log.error('Remote provider not set');
      this[active] = false;
      throw new Error('Remote provider not set');
    }

    if (this.active) {
      log.info('Already syncing. Terminating');
      return;
    }

    this[active] = true;
    log.info('Started');
    const cursor = await storage.settings.get('cursor');
    this.remote.cursor = cursor;

    try {
      const localDeltas = await deltas();
      const peek = await this.remote.peek();
      const total = (localDeltas.length * 2) + peek.length;
      const completed = count => {
        return 100 * count * (1 / total);
      };
      let index = 0;

      // Uploads, creates and deletes have rate limiting - await each
      for (const delta of localDeltas) {
        await this._applyRemote(delta);
        this.emit('progress', {
          value: completed(++index)
        });
      }

      const remoteDeltas = await this.remote.list();
      // There doesn't appear to be rate limiting for downloads
      await Promise.all(remoteDeltas.map(delta => this._applyLocal(delta).then(() => {
        this.emit('progress', {
          value: completed(++index)
        });
      })));

      await storage.settings.set('cursor', this.remote.cursor);
      log.info('Finished');
      this[active] = false;
    } catch (error) {
      log.error('Sync error occurred', error);
      this[active] = false;
      throw error;
    }
  }
}

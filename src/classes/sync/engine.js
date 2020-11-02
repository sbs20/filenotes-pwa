import FileContent from '../files/file-content';
import FilePath from '../files/file-path';
import Log from '../log';
import RemoteProvider from '../remote-provider';
import Storage from './storage';

const storage = new Storage();
const log = Log.get('sync-engine');

export default class SyncEngine {
  constructor() {
  }

  /**
   * Resolves all actions to take
   * @returns {Promise.<SyncActions>}
   */
  async resolveSyncActions() {
    const join = {};
    const incoming = await RemoteProvider.list();
    const outgoing = await storage.deltas();
    const keys = [];

    outgoing.forEach(metadata => {
      keys.push(metadata.key);
      join[metadata.key] = {
        local: metadata,
        remote: undefined
      };
    });

    incoming.forEach(metadata => {
      if (metadata.key in join) {
        join[metadata.key].remote = metadata;
      } else {
        keys.push(metadata.key);
        join[metadata.key] = {
          local: undefined,
          remote: metadata
        };
      }
    });
    
    /** @type {SyncQueue} */
    const queue = {
      /** @type {Array.<Metadata>} */
      incoming: [],
      /** @type {Array.<Metadata>} */
      outgoing: []
    };
  
    for (const key of keys) {
      const item = join[key]
      if (item.local && item.remote === undefined) {
        queue.outgoing.push(item.local);
      } else if (item.local === undefined && item.remote) {
        queue.incoming.push(item.remote);
      } else {
        if (item.local.tag === 'deleted' && item.remote.tag === 'deleted') {
          // Do nothing
        } else if (item.local.tag === 'deleted') {
          // Favour the remote update
          queue.incoming.push(item.remote);
        } else if (item.remote.tag === 'deleted') {
          // Favour the local update
          queue.outgoing.push(item.local);
        } else if (item.local.tag === 'folder' && item.remote.tag === 'folder') {
          // Do nothing
        } else if (item.local.tag === 'folder') {
          // There is a file with the same name as a folder. Rename the file

        } else if (item.remote.tag === 'folder') {
          // There is a file with the same name as a folder. Rename the file

        } else if (item.local.hash === item.remote.hash) {
          // Do nothing

        } else {
          // File conflict. Rename local, quicker
          const filepath = new FilePath(item.local.path);
          const destinationPath = `${filepath.directory}${filepath.stem}.${Date.now()}.conflict.${filepath.extension}`;
          const destination = await storage.move(item.local.path, destinationPath);
          queue.outgoing.push(destination);
          queue.incoming.push(item.remote);
        }
      }
    }

    return queue;
  }

  async execute() {
    log.info('Start');
    // Reset cursor for testing
    RemoteProvider.cursor = null;

    const actions = await this.resolveSyncActions();
    const incoming = actions.incoming;

    // upload all outbound
    // apply inbound to fs (& delete inbound for each)
    //   do all deletions first
    //   then do all folders ordered by length asc
    //   then find files with matching hash
    //   else update, delete content data
    // for fs without data, download

    const localIndex = (await storage.list())
      .reduce((output, item) => {
        output[item.key] = item.hash;
        return output;
      }, {}
    );

    const deletes = incoming.filter(metadata => {
      return metadata.key in localIndex && metadata.tag === 'deleted';
    });

    log.debug('deletes', deletes);
    await storage.delete(deletes.map(metadata => metadata.key));

    const updates = incoming.filter(metadata => {
      return (!(metadata.key in localIndex) || metadata.hash !== localIndex[metadata.key])
        && metadata.tag !== 'deleted';
    });

    log.debug('updates', updates);
    await storage.write(updates);

    await this.syncContent();
  }

  async syncContent() {
    const queue = await storage.listWithoutContent()

    log.debug('content queue', queue);

    await Promise.all(queue.map(async key => {
      try {
        const content = FileContent.create(key, await RemoteProvider.read(key));
        await storage.writeContent([content]);  
        log.debug('downloaded', key);
      } catch (error) {
        log.error(`error downloading ${key}`, error);
      }
    }));

    log.debug('finished sync');
  }
}

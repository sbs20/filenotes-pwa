//import Convert from './convert';
import FileContent from './files/file-content';
//import FileMetadata from './files/file-metadata';
import FilePath from './files/file-path';
import Log from './log';
import RemoteProvider from './remote-provider';
import SyncProvider from './sync-provider';

class Sync {
  constructor() {
  }

  /**
   * Resolves all actions to take
   * @returns {Promise.<SyncActions>}
   */
  async resolveSyncActions() {
    const join = {};
    const incoming = await RemoteProvider.list();
    /** @type {Array.<Metadata>} */
    const outgoing = await SyncProvider.deltas();
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
          const destination = await SyncProvider.move(item.local.path, destinationPath);
          queue.outgoing.push(destination);
          queue.incoming.push(item.remote);
        }
      }
    }

    return queue;
  }

  async execute() {
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

    const localIndex = (await SyncProvider.list())
      .reduce((output, item) => {
        output[item.key] = item.hash;
        return output;
      }, {}
    );

    const deletes = incoming.filter(metadata => {
      return metadata.key in localIndex && metadata.tag === 'deleted';
    });

    Log.debug('deletes', deletes);
    await SyncProvider.delete(deletes.map(metadata => metadata.key));

    const updates = incoming.filter(metadata => {
      return (!(metadata.key in localIndex) || metadata.hash !== localIndex[metadata.key])
        && metadata.tag !== 'deleted';
    });

    Log.debug('updates', updates);
    await SyncProvider.write(updates);

    await this.syncContent();
  }

  async syncContent() {
    const queue = await SyncProvider.listWithoutContent()

    Log.debug('content queue', queue);

    await Promise.all(queue.map(async key => {
      const content = FileContent.create(key, await RemoteProvider.read(key));
      await SyncProvider.writeContent([content]);
      Log.debug('downloaded', key);
    }));

    Log.debug('finished sync');
  }
}

const sync = new Sync();

export default sync;

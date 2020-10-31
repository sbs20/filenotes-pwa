/*
Queue out
Queue in
On local change, add to qo
Sync
Get next cursor to qi
Do queue out no conflict
Do queue in no conflict
  If hash same, ignore
  Else update, delete content
Handle conflict (strategy) 
Update content for all that need it
*/
import Convert from './convert';
import LocalProvider from './local-provider';
import Log from './log';
import RemoteProvider from './remote-provider';
import StorageManager from './storage/storage-manager';

class Sync {
  constructor() {
  }

  fixConflicts() {
    /*
    if hash == hash then remove from both
    Strategies:
    * Most recent wins
    * Server wins
    * Client wins
    * Save both
    */
  }

  async execute() {
    // Reset cursor for testing
    RemoteProvider.cursor = null;

    const incoming = await RemoteProvider.list();

    this.fixConflicts();
    // upload all outbound
    // apply inbound to fs (& delete inbound for each)
    //   do all deletions first
    //   then do all folders ordered by length asc
    //   then find files with matching hash
    //   else update, delete content data
    // for fs without data, download

    const localIndex = (await LocalProvider.list())
      .reduce((output, item) => {
        output[item.key] = item.hash;
        return output;
      }, {}
    );

    const deletes = incoming.filter(metadata => {
      return metadata.key in localIndex && metadata.tag === 'deleted';
    });

    Log.debug('deletes', deletes);
    await StorageManager.fs.metadata.deleteAll(deletes.map(metadata => metadata.key));
    await StorageManager.fs.content.deleteAll(deletes.map(metadata => metadata.key));

    const updates = incoming.filter(metadata => {
      return (!(metadata.key in localIndex) || metadata.hash !== localIndex[metadata.key])
        && metadata.tag !== 'deleted';
    });

    Log.debug('updates', updates);
    await StorageManager.fs.metadata.writeAll(updates);
    await StorageManager.fs.content.deleteAll(updates.map(metadata => metadata.key));

    await this.syncContent();
  }

  async syncContent() {
    const content = (await StorageManager.fs.content.keys())
      .reduce((output, key) => {
        output[key] = true;
        return output;
      }, {});

    const queue = (await StorageManager.fs.metadata.list())
      .filter(metadata => metadata.tag === 'file' && !(metadata.key in content))
      .map(metadata => metadata.key);

    Log.debug('content queue', queue);

    await Promise.all(queue.map(async key => {
      const content = {
        key: key,
        data: await RemoteProvider.read(key)
      };
      if (key.endsWith('.txt')) {
        content.preview = Convert.arrayBufferToString(content.data).substr(0, 64);
      }
      await StorageManager.fs.content.writeAll([content]);
      Log.debug('downloaded', key);
    }));

    Log.debug('finished sync');
  }
}

const sync = new Sync();

export default sync;

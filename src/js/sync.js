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
import RemoteService from './remote-service-manager';
import Storage from './storage';

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
    RemoteService.service.cursor = null;
    const incoming = await RemoteService.service.list();
    //const outgoing = [];

    this.fixConflicts();
    // upload all outbound
    // apply inbound to fs (& delete inbound for each)
    //   do all deletions first
    //   then do all folders ordered by length asc
    //   then find files with matching hash
    //   else update, delete content data
    // for fs without data, download

    const localIndex = (await Storage.fs.metadata.list())
      .reduce((output, item) => {
        output[item.key] = item.hash;
        return output;
      }, {});

    const deltas = incoming.filter(metadata => {
      return !(metadata.key in localIndex) || metadata.hash !== localIndex[metadata.key];
    });

    await Storage.fs.metadata.write(deltas);
    deltas.forEach(async file => {
      await Storage.fs.content.delete(file.key);
    });

    await this.downloadMissingContent();
  }

  async downloadMissingContent() {
    const content = (await Storage.fs.content.keys())
      .reduce((output, key) => {
        output[key] = true;
        return output;
      }, {});

    const queue = (await Storage.fs.metadata.list())
      .filter(metadata => metadata.tag === 'file' && !(metadata.key in content))
      .map(metadata => metadata.key);

    queue.forEach(async key => {
      const content = {
        key: key,
        data: await RemoteService.service.read(key)
      };
      if (key.endsWith('.txt')) {
        content.preview = Convert.arrayBufferToString(content.data).substr(0, 64);
      }
      await Storage.fs.content.write([content]);
    });
  }
}

const sync = new Sync();

export default sync;

import ActionResolver from './action-resolver';

export default class ActionBuilder {
  constructor() {}

  /**
   * Resolves all actions to take
   * @param {Array.<Metadata>} list - Local files
   * @param {Array.<Metadata>} deltas - Local deltas
   * @param {Array.<Metadata>} incoming - Remote files
   * @returns {Promise.<Array.<SyncAction>>}
   */
  static async build(list, deltas, incoming) {
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
      const itemActions = await ActionResolver.resolve(item.local, item.delta, item.remote);
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
}
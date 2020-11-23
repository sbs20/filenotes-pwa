import EventBus from './event-bus';
import Log from './log';
import RemoteProvider from './remote-provider';
import Storage from './storage';
import SyncEngine from './sync-engine';
import DropboxProvider from '../classes/dropbox-provider';
import LocalProvider from '../classes/local-provider';

const LocalProviderService = new LocalProvider();
const HashService = {
  hash: DropboxProvider.hash
};

export {
  EventBus,
  HashService as Hasher,
  LocalProviderService as LocalProvider,
  Log,
  RemoteProvider,
  Storage as StorageService,
  SyncEngine
};

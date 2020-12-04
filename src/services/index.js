import RemoteProvider from './remote-provider';
import DropboxProvider from '../classes/dropbox-provider';

const HashService = {
  hash: DropboxProvider.hash
};

export {
  HashService as Hasher,
  RemoteProvider
};

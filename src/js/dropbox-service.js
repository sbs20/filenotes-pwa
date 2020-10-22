import CloudService from './cloud-service';
import { Dropbox } from 'dropbox';

export default class DropboxService extends CloudService {
  constructor(options) {
    super();
    this.options = options || {};
    this.dbx = null;
    this.cursor = null;
  }

  _create() {
    return new Dropbox({
      accessToken: this.options.accessToken,
      clientId: this.options.clientId,
      fetch: (url, options) => fetch(url, options) });
  }

  authenticationUrl() {
    this.dbx = this._create();
    return this.dbx.auth.getAuthenticationUrl(this.options.authUrl);
  }

  async connect() {
    this.dbx = this._create();
    try {
      const account = await this.dbx.usersGetCurrentAccount();
      this.isAuthorised = true;
      this.currentAccountEmail = account.currentAccountEmail;
    } catch (error) {
      this.isAuthorised = false;
    }
    return this.isAuthorised;
  }

  asLocal(metadata) {
    const map = {
      '.tag': 'type',
      'name': 'name',
      'path_lower': 'key',
      'path_display': 'path',
      'id': 'id',
      'client_modified': 'clientModified',
      'server_modified': 'serverModified',
      'rev': 'rev',
      'size': 'size',
      'is_downloadable': 'downloadable',
      'content_hash': 'hash'
    };
    let file = {};
    for (let property in metadata) {
      file[map[property]] = metadata[property];
    }
    return file;
  }

  async list() {
    const files = [];
    let hasMore = true;

    const handleResult = (result) => {
      result.entries
        .map(metadata => this.asLocal(metadata))
        .forEach(file => files.push(file));
      
      this.cursor = result.cursor;
      hasMore = result.has_more;
    };

    if (this.cursor == null) {
      const response = await this.dbx.filesListFolder({
        path: '',
        recursive: true,
        include_deleted: true });

      handleResult(response.result);
    }

    while (hasMore) {
      const response = await this.dbx.filesListFolderContinue({ cursor: this.cursor });
      handleResult(response.result);
    }

    return files;
  }
}
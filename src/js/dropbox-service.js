import Convert from './convert';
import CloudService from './cloud-service';
import FieldAdapter from './field-adapter';
import QueryString from './query-string';
import { Dropbox } from 'dropbox';

const MAP = {
  '.tag': 'tag',
  'name': 'name',
  'path_lower': 'key',
  'path_display': 'path',
  // 'id': 'id',
  // 'client_modified': 'clientModified',
  'server_modified': 'modified',
  //'rev': 'rev',
  'size': 'size',
  'is_downloadable': 'downloadable',
  'content_hash': 'hash'
}

export default class DropboxService extends CloudService {
  constructor() {
    super();
    this._client = null;
    this.cursor = null;
    this.adapter = new FieldAdapter(MAP);
  }

  client() {
    if (this._client === null && this.options.clientId) {
      this._client = new Dropbox({
        accessToken: this.options.accessToken,
        clientId: this.options.clientId,
        fetch: (url, options) => fetch(url, options) });  
    }
    return this._client;
  }

  configure(options) {
    this._client = null;
    super.configure(options);
  }

  authenticationUrl() {
    return this.client().auth.getAuthenticationUrl(this.options.authUrl);
  }

  authenticationToken(uriHash) {
    this._client = null;
    this.options.accessToken = QueryString.parse(uriHash).access_token;
    return this.options.accessToken;
  }

  async connect() {
    try {
      const account = await this.client().usersGetCurrentAccount();
      this.connected = true;
      this.currentAccountEmail = account.currentAccountEmail;
    } catch (error) {
      this.connected = false;
    }
    return this.connected;
  }

  async list() {
    const files = [];
    let hasMore = true;

    const handleResult = (result) => {
      result.entries
        .map(metadata => this.adapter.asLocal(metadata))
        .forEach(file => files.push(file));
      
      this.cursor = result.cursor;
      hasMore = result.has_more;
    };

    if (this.cursor == null) {
      const response = await this.client().filesListFolder({
        path: '',
        recursive: true,
        include_deleted: true });

      handleResult(response.result);
    }

    while (hasMore) {
      const response = await this.client().filesListFolderContinue({ cursor: this.cursor });
      handleResult(response.result);
    }

    return files;
  }

  async read(path) {
    const response = await this.client().filesDownload({ path: path });
    const buffer = await Convert.blobToArrayBuffer(response.result.fileBlob);
    return buffer;
  }
}

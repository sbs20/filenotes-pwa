/**
 * @typedef {import('../typedefs/types').Metadata} Metadata
 * @typedef {import('../typedefs/types').ConfigureOptions} ConfigureOptions
 */

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

  /**
   * Configures the service. Can be called as many times as required.
   * @param {ConfigureOptions} options 
   */
  configure(options) {
    this._client = null;
    super.configure(options);
  }

  /**
   * Returns the authentication URL
   * @returns {string} The authentication URL
   */
  authenticationUrl() {
    return this.client().auth.getAuthenticationUrl(this.options.authUrl);
  }

  /**
   * Extracts the access token from the URI#hash
   * @param {string} uriHash The uri hash component
   * @returns {string} The access token
   */
  authenticationToken(uriHash) {
    this._client = null;
    this.options.accessToken = QueryString.parse(uriHash).access_token;
    return this.options.accessToken;
  }

  /**
   * Attempts to connect and returns whether or not it was successful
   * @returns {Promise.<bool>}
   */
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

  /**
   * Returns a list of file metadata objects
   * @returns {Promise.<Array.<Metadata>>}
   */
  async list() {
    const files = [];
    let hasMore = true;

    const handleResult = (result) => {
      result.entries
        .map(metadata => this.adapter.apply(metadata))
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

  /**
   * Returns the file data as an ArrayBuffer
   * @param {string} path
   * @returns {Promise.<ArrayBuffer>} 
   */
  async read(path) {
    const response = await this.client().filesDownload({ path: path });
    const buffer = await Convert.blobToArrayBuffer(response.result.fileBlob);
    return buffer;
  }
}

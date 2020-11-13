import Convert from '../utils/convert';
import CloudProvider from '../cloud-provider';
import FieldAdapter from '../utils/field-adapter';
import QueryString from '../utils/query-string';
import extend from '../utils/extend';
import { Dropbox } from 'dropbox';

const MAP = {
  '.tag': 'tag',
  'id': 'id',
  'name': 'name',
  'path_lower': 'key',
  'path_display': 'path',
  'rev': 'revision',
  'server_modified': 'modified',
  'size': 'size',
  'is_downloadable': 'downloadable',
  'content_hash': 'hash'
};

const client = Symbol();

export default class DropboxProvider extends CloudProvider {
  constructor() {
    super();
    this[client] = null;
    /** @type {ConfigureOptions} */
    this.options = null;
    /** @type {string} */
    this.cursor = null;
    this.adapter = new FieldAdapter(MAP);
  }

  /**
   * Ensures a Dropbox client
   * @returns {Dropbox} - Dropbox
   */
  client() {
    if (this[client] === null && this.options.clientId) {
      this[client] = new Dropbox({
        accessToken: this.options.accessToken,
        clientId: this.options.clientId,
        fetch: (url, options) => fetch(url, options)
      });  
    }
    return this[client];
  }

  /**
   * Configures the service. Can be called as many times as required.
   * @param {ConfigureOptions} options - Options
   */
  configure(options) {
    this[client] = null;
    this.connected = false;
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
    this[client] = null;
    this.options.accessToken = QueryString.parse(uriHash).access_token;
    return this.options.accessToken;
  }

  /**
   * Attempts to connect and returns whether or not it was successful
   * @param {ConfigureOptions} [options] - Options 
   * @returns {Promise.<bool>}
   */
  async connect(options) {
    try {
      if (options) {
        this.configure(options);
      }
      if (this.options.accessToken) {
        const response = await this.client().usersGetCurrentAccount();
        this.connected = true;
        const account = response.result;
        this.accountEmail = account.email;
        this.accountName = account.name.display_name;  
      }
    } catch (error) {
      this.connected = false;
    }
    return this.connected;
  }

  /**
   * Deletes a file or path
   * @param {string} path
   * @returns {Promise.<Metadata>}
   */
  async delete(path) {
    try {
      const response = await this.client().filesDeleteV2({ path: path });  
      return this.adapter.apply(response.result.metadata);
    } catch (exception) {
      // If it's already been deleted we can ignore it, otherwise, throw
      if (exception.error.indexOf('path_lookup/not_found') === -1) {
        throw exception;
      }
    }
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

    if (this.cursor === null || this.cursor === undefined) {
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
   * Creates a directory
   * @param {string} path
   */
  async mkdir(path) {
    try {
      const response = await this.client().filesCreateFolderV2({ path: path });
      return response.result;
    } catch (exception) {
      // If it already exists we can ignore it, otherwise, throw
      if (exception.error.indexOf('path/conflict/folder/') === -1) {
        throw exception;
      }
    }

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

  /**
   * Writes a file to dropbox
   * @param {Metadata} metadata 
   * @param {ArrayBuffer} buffer
   * @returns {Promise.<Metadata>}
   */
  async write(metadata, buffer) {
    /** @type {import('dropbox').files.CommitInfo} */
    const mode = metadata.revision
      ? { '.tag': 'update', update: metadata.revision }
      : { '.tag': 'add'};

    const commitInfo = {
      path: metadata.path, 
      contents: buffer,
      mode: mode,
      autorename: true,
      mute: false
    };

    return await this._write(commitInfo);
  }

  /**
   * Writes a file to dropbox
   * @param {import('dropbox').files.CommitInfo} commitInfo 
   * @returns {Promise.<Metadata>}
   */
  async _write(commitInfo) {
    const CHUNKING_THRESHOLD = 2 * 1024 * 1024;

    /** @type {ArrayBuffer} */
    const buffer = commitInfo.contents;
    
    if (buffer.byteLength < CHUNKING_THRESHOLD) {
      const response = await this.client().filesUpload(commitInfo);
      return extend({ tag: 'file' }, this.adapter.apply(response.result));
    } else {
      const MAX_CHUNK_SIZE = CHUNKING_THRESHOLD;
      for (let offset = 0, sessionId = null, chunkSize = 0; offset < buffer.byteLength; offset += chunkSize) {
        chunkSize = Math.min(MAX_CHUNK_SIZE, buffer.byteLength - offset);
        const chunk = buffer.slice(offset, offset + chunkSize);

        if (sessionId === null) {
          const response = await this.client().filesUploadSessionStart({ close: false, contents: chunk });
          sessionId = response.result.session_id;
        } else if (offset < buffer.byteLength - MAX_CHUNK_SIZE) {
          const cursor = { session_id: sessionId, offset: offset };
          await this.client().filesUploadSessionAppendV2({ cursor: cursor, close: false, contents: chunk });
        } else {
          delete commitInfo.contents;
          const response = await this.client().filesUploadSessionFinish({
            cursor: { session_id: sessionId, offset: buffer.byteLength - chunk.byteLength },
            commit: commitInfo,
            contents: chunk });           
          return extend({ tag: 'file' }, this.adapter.apply(response.result));
        }
      }
    }
  }
}

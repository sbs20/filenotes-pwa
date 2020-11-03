import Convert from '../utils/convert';
import CloudProvider from '../cloud-provider';
import FieldAdapter from '../utils/field-adapter';
import QueryString from '../utils/query-string';
import { Dropbox } from 'dropbox';

const MAP = {
  '.tag': 'tag',
  'name': 'name',
  'path_lower': 'key',
  'path_display': 'path',
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
        fetch: (url, options) => fetch(url, options) });  
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
        const account = await this.client().usersGetCurrentAccount();
        this.connected = true;
        // TODO : Account info
        this.currentAccountEmail = account.currentAccountEmail;  
      }
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

    // TODO : Linting
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
   * @param {string} path 
   * @param {ArrayBuffer} buffer
   * @returns {Promise.<Metadata>}
   */
  async write(path, buffer) {
    //const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
    const UPLOAD_FILE_SIZE_LIMIT = 1024;
    
    if (buffer.byteLength < UPLOAD_FILE_SIZE_LIMIT) {
      // File is smaller than 150 Mb - use filesUpload API
      const response = await this.client().filesUpload({
        path: path, 
        contents: buffer,
        mode: 'overwrite',
        autorename: true,
        mute: false
      });

      return this.adapter.apply(response.result);
    } else {
      // File is bigger than 150 Mb - use filesUploadSession* API
      // 8Mb - Dropbox JavaScript API suggested max file / chunk size
      const maxBlob = 1 * 1024 * 1024;
      let workItems = [];
      let offset = 0;

      // Create chunks
      // TODO move into loop
      while (offset < buffer.byteLength) {
        let chunkSize = Math.min(maxBlob, buffer.byteLength - offset);
        workItems.push(buffer.slice(offset, offset + chunkSize));
        offset += chunkSize;
      } 
      
      let sessionId = null;
      for (let index = 0; index < workItems.length; index++) {
        const chunk = workItems[index];
        if (index === 0) {
          const response = await this.client().filesUploadSessionStart({ close: false, contents: chunk });
          sessionId = response.result.session_id;
        } else if (index < workItems.length - 1) {
          const cursor = { session_id: sessionId, offset: index * maxBlob };
          await this.client().filesUploadSessionAppendV2({ cursor: cursor, close: false, contents: chunk });
        } else {
          let cursor = { session_id: sessionId, offset: buffer.byteLength - chunk.byteLength };
          let commit = { path: path, mode: 'overwrite', autorename: true, mute: false };
          const response = await this.client().filesUploadSessionFinish({ cursor: cursor, commit: commit, contents: chunk });           
          return this.adapter.apply(response.result);
        }
      }
    }
  }
}





import Convert from '../utils/convert';
import FieldAdapter from '../utils/field-adapter';
import extend from '../utils/extend';
import { Dropbox, DropboxAuth, files } from 'dropbox';
import { sha256Sync } from '../utils/sha256';

const LONG_POLL_TIMEOUT = 30;

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

export default class DropboxClient {
  private client: Dropbox | any;
  private options: IDropboxClientOptions;
  private polling: boolean;
  private adapter: FieldAdapter<IMetadata>;
  private abortController: AbortController;
  protected connected: boolean;
  protected account: IRemoteAccount;
  cursor?: string;

  /**
   * Constructor
   * @param {ConfigureOptions} options - Options
   */
  constructor(options: IDropboxClientOptions) {
    this.options = options;
    this.polling = false;
    this.adapter = new FieldAdapter<IMetadata>(MAP);
    this.connected = false;
    this.abortController = new AbortController();
    this.account = {
      avatar: '',
      name: '',
      email: ''
    };

    this.client = new Dropbox({
      clientId: this.options.clientId,
      fetch: (url: string, options: any):Promise<Response> => {
        this.abortController = new AbortController();
        options.signal = this.abortController.signal;
        return fetch(url, options);
      }
    });
  }

  abort():void {
    this.abortController.abort();
    this.polling = false;
  }

  private get auth(): DropboxAuth | any {
    const client = this.client as any;
    return client.auth;
  }

  protected set refreshToken(value: string) {
    this.auth.setRefreshToken(value);
  }

  /**
   * Returns the authentication parameters
   */
  protected pkceStart(): IPkceParameters {
    const auth = this.auth as any;
    const url = this.auth.getAuthenticationUrl(
      this.options.authUrl, undefined, 'code', 'offline', undefined, 'none', true);
    return {
      challenge: auth.codeChallenge,
      url: url,
      verifier: auth.codeVerifier
    };
  }

  /**
   * Continues the PKCE process
   * @param {IPkceParameters} params The PKCE parameters
   * @returns {Promise.<IOAuthToken>} The access token
   */
  protected async pkceFinish(params: IPkceParameters): Promise<IOAuthToken | undefined> {
    const auth = this.auth as any;
    auth.codeChallenge = params.challenge;
    auth.codeVerifier = params.verifier;
    if (params.code !== undefined) {
      delete this.account.oauth;

      try {
        const response = await this.auth.getAccessTokenFromCode(this.options.authUrl, params.code);
        const token = response.result;
        this.refreshToken = token.refresh_token;
        return token;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  /**
   * Attempts to connect and returns whether or not it was successful
   */
  protected async connect(): Promise<boolean> {
    try {
      const response = await this.client.usersGetCurrentAccount();
      this.connected = true;

      const account = response.result;
      this.account.name = account.name.display_name;
      this.account.email = account.email;
      this.account.avatar = account.profile_photo_url;

    } catch (error) {
      this.account = {
        avatar: '',
        name: '',
        email: ''
      };
      this.connected = false;
    }
    return this.connected;
  }

  /**
   * Attempts to connect
   */
  protected async startFromToken(oauth: IOAuthToken): Promise<boolean> {
    if (oauth && oauth.refresh_token) {
      this.refreshToken = oauth.refresh_token;
      this.account.oauth = oauth;
      if (await this.connect()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Deletes a file or path
   * @param {string} path
   * @returns {Promise.<IMetadata>}
   */
  async delete(path: string): Promise<IMetadata | undefined> {
    try {
      const response = await this.client.filesDeleteV2({ path: path });  
      return this.adapter.apply(response.result.metadata) as IMetadata;
    } catch (exception) {
      // If it's already been deleted we can ignore it, otherwise, throw
      if (exception.error.indexOf('path_lookup/not_found') === -1) {
        throw exception;
      }
    }

    return undefined;
  }

  /**
   * Returns a list of file metadata objects
   */
  async list(): Promise<IMetadata[]> {
    const files: IMetadata[] = [];
    let hasMore = true;

    const handleResult = (result: files.ListFolderResult):void => {
      result.entries
        .map(metadata => this.adapter.apply(metadata))
        .forEach(file => files.push(file));
      
      this.cursor = result.cursor;
      hasMore = result.has_more;
    };

    if (this.cursor === null || this.cursor === undefined) {
      const response = await this.client.filesListFolder({
        path: '',
        recursive: true,
        include_deleted: true });

      handleResult(response.result);
    }

    while (hasMore) {
      const response = await this.client.filesListFolderContinue({ cursor: this.cursor as string });
      handleResult(response.result);
    }

    return files;
  }

  /**
   * Returns a list of file metadata objects without updating the cursor
   */
  async peek(): Promise<IMetadata[]> {
    const cursor = this.cursor;
    const list = await this.list();
    this.cursor = cursor;
    return list;
  }

  /**
   * Returns when there's an update
   */
  async poll(): Promise<boolean> {
    if (this.polling) {
      throw new Error('Already polling');
    }

    try {
      this.polling = true;
      const response = await this.client.filesListFolderLongpoll({
        cursor: this.cursor as string,
        timeout: LONG_POLL_TIMEOUT
      });

      if (response.result.changes === undefined) {
        throw new Error(`Polling error: ${response.result}`);
      }

      return response.result.changes;

    } finally {
      this.polling = false;
    }
  }

  /**
   * Creates a directory
   */
  async mkdir(path: string): Promise<void> {
    try {
      const response = await this.client.filesCreateFolderV2({ path: path });
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
   */
  async read(path: string): Promise<ArrayBuffer> {
    const response = await this.client.filesDownload({ path: path });
    const buffer = await Convert.blobToArrayBuffer(response.result.fileBlob);
    return buffer;
  }

  /**
   * Writes a file to dropbox
   */
  async write(metadata: IMetadata, buffer: ArrayBuffer): Promise<IMetadata> {
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
   */
  private async _write(commitInfo: files.CommitInfo | any): Promise<IMetadata> {
    const CHUNKING_THRESHOLD = 2 * 1024 * 1024;

    const buffer = commitInfo.contents as ArrayBuffer;
    
    if (buffer.byteLength < CHUNKING_THRESHOLD) {
      const response = await this.client.filesUpload(commitInfo);
      return extend({ tag: 'file' }, this.adapter.apply(response.result));
    } else {
      const MAX_CHUNK_SIZE = CHUNKING_THRESHOLD;
      for (let offset = 0, sessionId = null, chunkSize = 0; offset < buffer.byteLength; offset += chunkSize) {
        chunkSize = Math.min(MAX_CHUNK_SIZE, buffer.byteLength - offset);
        const chunk = buffer.slice(offset, offset + chunkSize);

        if (sessionId === null) {
          const response = await this.client.filesUploadSessionStart({ close: false, contents: chunk });
          sessionId = response.result.session_id;
        } else if (offset < buffer.byteLength - MAX_CHUNK_SIZE) {
          const cursor = { session_id: sessionId, offset: offset };
          await this.client.filesUploadSessionAppendV2({ cursor: cursor, close: false, contents: chunk });
        } else {
          delete commitInfo.contents;
          const response = await this.client.filesUploadSessionFinish({
            cursor: { session_id: sessionId, offset: buffer.byteLength - chunk.byteLength },
            commit: commitInfo,
            contents: chunk });           
          return extend({ tag: 'file' }, this.adapter.apply(response.result));
        }
      }
    }

    throw new Error('Should not get here');
  }

  /**
   * Calculates the content hash
   * @param {BufferLike} buffer - The byte array
   * @returns {string} - Hex encoded hash
   */
  hash(buffer: BufferLike): string {
    const BLOCK_SIZE = 4 * 1024 * 1024;
    if (!Buffer.isBuffer(buffer)) {
      buffer = Buffer.from(buffer);
    }

    const digests: ArrayBuffer[] = [];
    const bufferLength = (buffer as Buffer).length;
    for (let offset = 0, length = 0; offset < bufferLength; offset += length) {
      length = Math.min(bufferLength - offset, BLOCK_SIZE);
      const block = buffer.slice(offset, offset + length);
      const digest = sha256Sync(block);
      digests.push(digest);
    }

    const digestsConcat = Convert.arrayBuffersConcat(digests);
    const superDigest = sha256Sync(digestsConcat);
    const hex = Convert.arrayBufferToHex(superDigest);
    return hex;
  }
}

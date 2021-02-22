type FileType = 'audio'|'text'|'image'|'todotxt'|'unknown';
type Tag = 'file'|'folder'|'deleted';
type BufferLike = Uint8Array | ArrayBuffer | Buffer;

interface IDictionary<T> {
  [key: string]: T
}

interface IOAuthToken {
  uid: string;
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
  account_id: string;
}

interface IPkceParameters {
  url?: string;
  challenge: string;
  verifier: string;
  code?: string;
}

interface IDropboxClientOptions {
  clientId: string;
  authUrl: string;
}

interface IRemoteAccount {
  name?: string;
  email?: string;
  avatar?: string;
  oauth?: IOAuthToken;
}

interface IMetadata {
  tag: Tag;
  key: string;
  name: string;
  id?: string;
  revision?: string;
  hash?: string;
  modified?: string;
  path: string;
  size?: number;
  downloadable?: boolean;
}

interface IContent {
  key: string;
  preview?: string;
  data: ArrayBuffer;
}

interface IRemoteProvider {
  cursor?: string;
  accountClear(): Promise<void>;
  authenticate(window: Window): Promise<boolean>;
  start(window: Window): Promise<boolean>;
  abort():void;
  delete(path: string): Promise<IMetadata | undefined>;
  list(): Promise<IMetadata[]>;
  peek(): Promise<IMetadata[]>;
  poll(): Promise<boolean>;
  mkdir(path: string): Promise<void>;
  read(path: string): Promise<ArrayBuffer>;
  write(metadata: IMetadata, buffer: ArrayBuffer): Promise<IMetadata>;
  hash(buffer: BufferLike): string;
}

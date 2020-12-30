type FileType = 'audio'|'text'|'image'|'unknown';
type Tag = 'file'|'folder'|'deleted';
type BufferLike = Uint8Array | ArrayBuffer | Buffer;

interface Dictionary<T> {
  [key: string]: T
}

interface OAuthToken {
  uid: string;
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
  account_id: string;
}

interface PkceParameters {
  url?: string;
  challenge: string;
  verifier: string;
  code?: string;
}

interface DropboxClientOptions {
  clientId: string;
  authUrl: string;
}

interface RemoteAccount {
  name?: string;
  email?: string;
  avatar?: string;
  oauth?: OAuthToken;
}

interface Metadata {
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

interface Content {
  key: string;
  preview?: string;
  data: ArrayBuffer;
}

interface RemoteProvider {
  cursor?: string;
  accountClear(): Promise<void>;
  authenticate(window: Window): Promise<boolean>;
  start(window: Window): Promise<boolean>;
  abort():void;
  delete(path: string): Promise<Metadata | undefined>;
  list(): Promise<Metadata[]>;
  peek(): Promise<Metadata[]>;
  poll(): Promise<boolean>;
  mkdir(path: string): Promise<void>;
  read(path: string): Promise<ArrayBuffer>;
  write(metadata: Metadata, buffer: ArrayBuffer): Promise<Metadata>;
  hash(buffer: BufferLike): string;
}

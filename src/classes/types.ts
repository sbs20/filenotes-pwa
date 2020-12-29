type FileType = 'audio'|'text'|'image'|'unknown';
type Tag = 'file'|'folder'|'deleted';
type BufferLike = Uint8Array | ArrayBuffer | Buffer;

interface Dictionary<T> {
  [key: string]: T
}

// interface OAuthToken {
//   uid: string;
//   access_token: string;
//   expires_in: number;
//   token_type: string;
//   scope: string;
//   refresh_token: string;
//   account_id: string;
// }

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

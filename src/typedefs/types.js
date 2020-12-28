/**
 * @typedef {Object} ConfigureOptions
 * @property {string} oauthToken - The access token
 * @property {string} clientId - The app client id
 * @property {string} [authUrl] - The return url
 */

/**
 * @typedef {Object} Event
 * @property {any} data - The event data
 */

/**
 * @typedef {Object} OAuthToken
 * @property {string} uid
 * @property {string} access_token
 * @property {number} expires_in
 * @property {string} token_type
 * @property {string} scope
 * @property {string} refresh_token
 * @property {string} account_id
 */

/**
 * @typedef {Object} RemoteAccount
 * @property {string} name - Account name
 * @property {string} email - Email address
 * @property {string} avatar - Avatar url
 * @property {OAuthToken} oauth - OAuth token
 */

/**
 * @typedef {Object} MetadataX
 * @property {('file'|'folder'|'deleted')} tag
 * @property {string} key - The lowercase path
 * @property {string} name - The filename
 * @property {string} [id] - The id
 * @property {string} [revision] - The revision
 * @property {string} [hash] - sha256 of the file content
 * @property {string} [modified] - ISO8601 date string of the last modified time
 * @property {string} path - The filepath
 * @property {number} [size] - The size in bytes
 * @property {bool} downloadable - True if downloadable
 */

/**
 * @typedef {Object} ContentX
 * @property {string} key - The lowercase path
 * @property {string} [preview] - Preview data
 * @property {ArrayBuffer} data - The data
 */

/**
 * @typedef {Object} PkceParameters
 * @property {string} [url]
 * @property {string} challenge
 * @property {string} verifier
 * @property {string} [code]
 */

/**
 * @typedef {Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer} BufferLike
 */

/**
 * @typedef {'hide'|'save'|'close'|'discard'|'sync'} FileAction
 */

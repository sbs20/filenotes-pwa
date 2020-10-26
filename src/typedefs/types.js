/**
 * @typedef {Object} ConfigureOptions
 * @property {string} accessToken - The access token
 * @property {string} clientId - The app client id
 * @property {string} [authUrl] - The return url
 */

/**
 * @typedef {Object} Metadata
 * @property {('file'|'folder'|'deleted')} tag
 * @property {string} key - The lowercase path
 * @property {string} name - The filename
 * @property {string} [hash] - sha256 of the file content
 * @property {string} [modified] - ISO8601 date string of the last modified time
 * @property {string} path - The filepath
 * @property {number} [size] - The size in bytes
 * @property {bool} downloadable - True if downloadable
 */

import cryptojs from 'crypto';

/**
 * Native SHA256 hash
 * @param {ArrayBuffer} buffer - The byte array
 * @returns {Promise.<ArrayBuffer>} - Promise<ArrayBuffer> byte hash
 */
export async function sha256Native(buffer) {
  const ALGORITHM = 'SHA-256';
  return await crypto.subtle.digest(ALGORITHM, buffer);
}

/**
 * JavaScript SHA256 hash
 * @param {BufferLike} buffer - The byte array
 * @returns {ArrayBuffer} - The byte hash
 */
export function sha256Sync(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    buffer = Buffer.from(buffer);
  }
  const ALGORITHM = 'sha256';
  return cryptojs.createHash(ALGORITHM).update(buffer).digest().buffer;
}

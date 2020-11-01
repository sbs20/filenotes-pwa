import Convert from './convert';

/**
 * Calculates the content hash
 * @param {ArrayBuffer} buffer - The byte array
 * @returns {Promise.<string>} - Promise<string> Hex encoded hash
 */
export default async function hash(buffer) {
  const ALGORITHM = 'SHA-256';
  const BLOCK_SIZE = 4 * 1024 * 1024;
  if (!Buffer.isBuffer(buffer)) {
    buffer = Buffer.from(buffer);
  }

  /** @type {Array.<ArrayBuffer>} */
  const digests = [];
  for (let offset = 0, length = 0; offset < buffer.length; offset += length) {
    length = Math.min(buffer.length - offset, BLOCK_SIZE);
    const block = buffer.slice(offset, offset + length);
    const digest = await crypto.subtle.digest(ALGORITHM, block);
    digests.push(digest);
  }

  const digestsConcat = Convert.arrayBuffersConcat(digests);
  const superDigest = await crypto.subtle.digest(ALGORITHM, digestsConcat);
  const hex = Convert.arrayBufferToHex(superDigest);
  return hex;
}

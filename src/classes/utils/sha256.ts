import cryptojs from 'crypto';

/**
 * Native SHA256 hash
 */
export async function sha256Native(buffer: ArrayBuffer): Promise<ArrayBuffer> {
  const ALGORITHM = 'SHA-256';
  return await crypto.subtle.digest(ALGORITHM, buffer);
}

/**
 * JavaScript SHA256 hash
 */
export function sha256Sync(buffer: BufferLike): ArrayBuffer {
  if (!Buffer.isBuffer(buffer)) {
    buffer = Buffer.from(buffer);
  }
  const ALGORITHM = 'sha256';
  return cryptojs.createHash(ALGORITHM).update(buffer as Buffer).digest().buffer;
}

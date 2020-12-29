//https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/indexeddb-best-practices
export default class Convert {
  /**
   * Converts a Blob to an ArrayBuffer
   */
  static blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        resolve(reader.result as ArrayBuffer);
      });
      reader.addEventListener('error', reject);
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   * Converts an ArrayBuffer to a Blob
   */
  static arrayBufferToBlob(buffer: ArrayBuffer, type?: string): Blob {
    const t = type || 'application/octet-stream';
    return new Blob([buffer], {type: t});
  }

  /**
   * Converts a string to an ArrayBuffer
   */
  static stringToArrayBuffer(string: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(string).buffer;
  }
  
  /**
   * Converts an ArrayBuffer to a string
   */
  static arrayBufferToString(buffer: ArrayBuffer): string {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  }

  /**
   * Converts an ArrayBuffer to a hex string
   */
  static arrayBufferToHex(buffer: ArrayBuffer): string {
    const array = Array.from(new Uint8Array(buffer));
    const hex = array.map(b => b.toString(16).padStart(2, '0')).join('');
    return hex;
  }

  /**
   * Takes an array of ArrayBuffers and concenates them into a single buffer
   * @param {Array.<ArrayBuffer>} buffers 
   * @returns {ArrayBuffer} Concatenated ArrayBuffer
   */
  static arrayBuffersConcat(buffers: ArrayBuffer[]): ArrayBuffer {
    let size = buffers.map(buffer => buffer.byteLength).reduce((a, b) => a + b, 0);
    let result = new Uint8Array(size);
    let offset = 0;
    for (const buffer of buffers) {
      result.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }
    return result.buffer;
  }
}

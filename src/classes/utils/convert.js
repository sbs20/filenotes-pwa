//https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/indexeddb-best-practices
export default {
  /**
   * Converts a Blob to an ArrayBuffer
   * @param {Blob} blob The blob to convert
   * @returns {Promise.<ArrayBuffer>} A Promise<ArrayBuffer>
   */
  blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        resolve(reader.result);
      });
      reader.addEventListener('error', reject);
      reader.readAsArrayBuffer(blob);
    });
  },

  /**
   * Converts an ArrayBuffer to a Blob
   * @param {ArrayBuffer} buffer The ArrayBuffer to convert
   * @param {string} [type] Type. Default is 'application/octet-stream'
   * @returns {Blob} A Blob
   */
  arrayBufferToBlob(buffer, type) {
    const t = type || 'application/octet-stream';
    return new Blob([buffer], {type: t});
  },

  /**
   * Converts a string to an ArrayBuffer
   * @param {string} string The string to convert
   * @returns {ArrayBuffer} An ArrayBuffer
   */
  stringToArrayBuffer(string) {
    const encoder = new TextEncoder();
    return encoder.encode(string).buffer;
  },
  
  /**
   * Converts an ArrayBuffer to a string
   * @param {ArrayBuffer} buffer The ArrayBuffer to convert
   * @returns {string} A string
   */
  arrayBufferToString(buffer) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  },

  /**
   * Converts an ArrayBuffer to a hex string
   * @param {ArrayBuffer} buffer The ArrayBuffer to convert
   * @returns {string} A hex encoded string
   */
  arrayBufferToHex(buffer) {
    const array = Array.from(new Uint8Array(buffer));
    const hex = array.map(b => b.toString(16).padStart(2, '0')).join('');
    return hex
  },

  /**
   * Takes an array of ArrayBuffers and concenates them into a single buffer
   * @param {Array.<ArrayBuffer>} buffers 
   * @returns {ArrayBuffer} Concatenated ArrayBuffer
   */
  arrayBuffersConcat(buffers) {
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

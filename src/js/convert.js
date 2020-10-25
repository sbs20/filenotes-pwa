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
  }  
}

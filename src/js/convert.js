//https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/indexeddb-best-practices
export default {
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

  arrayBufferToBlob(buffer, type) {
    const t = type || 'application/octet-stream';
    return new Blob([buffer], {type: t});
  },

  stringToArrayBuffer(string) {
    const encoder = new TextEncoder();
    return encoder.encode(string).buffer;
  },
  
  arrayBufferToString(buffer) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  }  
}

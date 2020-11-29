export default {
  /**
   * @param {Metadata} metadata1 
   * @param {Metadata} metadata2 
   */
  byFolderThenNameAscending(metadata1, metadata2) {
    return metadata1.tag !== metadata2.tag
      ? -metadata1.tag.localeCompare(metadata2.tag)
      : metadata1.key.localeCompare(metadata2.key);
  },

  /**
   * @param {Metadata} metadata1 
   * @param {Metadata} metadata2 
   */
  byFolderThenDateAscending(metadata1, metadata2) {
    return metadata1.tag !== metadata2.tag
      ? -metadata1.tag.localeCompare(metadata2.tag)
      : metadata1.modified.localeCompare(metadata2.modified);
  },

  /**
   * @param {Metadata} metadata1 
   * @param {Metadata} metadata2 
   */
  byFolderThenDateDescending(metadata1, metadata2) {
    return metadata1.tag !== metadata2.tag
      ? -metadata1.tag.localeCompare(metadata2.tag)
      : -metadata1.modified.localeCompare(metadata2.modified);
  }
};
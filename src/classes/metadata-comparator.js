import Constants from './constants';

/**
 * @param {Metadata} metadata1 
 * @param {Metadata} metadata2 
 * @returns {number}
 */
function byNameAscending(metadata1, metadata2) {
  return metadata1.key.localeCompare(metadata2.key);
}

/**
 * @param {Metadata} metadata1 
 * @param {Metadata} metadata2 
 * @returns {number}
 */
function byNameDescending(metadata1, metadata2) {
  return byNameAscending(metadata1, metadata2) * -1;
}

/**
 * @param {Metadata} metadata1 
 * @param {Metadata} metadata2 
 * @returns {number}
 */
function byFolderThenNameAscending(metadata1, metadata2) {
  return metadata1.tag !== metadata2.tag
    ? -metadata1.tag.localeCompare(metadata2.tag)
    : metadata1.key.localeCompare(metadata2.key);
}

/**
 * @param {Metadata} metadata1 
 * @param {Metadata} metadata2 
 * @returns {number}
 */
function byFolderThenNameDescending(metadata1, metadata2) {
  return metadata1.tag !== metadata2.tag
    ? -metadata1.tag.localeCompare(metadata2.tag)
    : -metadata1.key.localeCompare(metadata2.key);
}

/**
 * @param {Metadata} metadata1 
 * @param {Metadata} metadata2 
 * @returns {number}
 */
function byFolderThenDateAscending(metadata1, metadata2) {
  return metadata1.tag !== metadata2.tag
    ? -metadata1.tag.localeCompare(metadata2.tag)
    : metadata1.modified
      ? metadata1.modified.localeCompare(metadata2.modified)
      : 0;
}

/**
 * @param {Metadata} metadata1 
 * @param {Metadata} metadata2 
 * @returns {number}
 */
function byFolderThenDateDescending(metadata1, metadata2) {
  return -byFolderThenDateAscending(metadata1, metadata2);
}

/**
 * @param {Metadata} metadata1 
 * @param {Metadata} metadata2 
 * @returns {number}
 */
function bySizeAscending(metadata1, metadata2) {
  return metadata1.tag !== metadata2.tag
    ? -metadata1.tag.localeCompare(metadata2.tag)
    : metadata1.size !== undefined
      ? metadata1.size - metadata2.size
      : 0;
}

/**
 * @param {Metadata} metadata1 
 * @param {Metadata} metadata2 
 * @returns {number}
 */
function bySizeDescending(metadata1, metadata2) {
  return -bySizeAscending(metadata1, metadata2);
}

export default {
  /**
   * 
   * @param {string} sortBy 
   * @returns {function(Metadata, Metadata):number}
   */
  get(sortBy) {
    switch (sortBy) {
      case Constants.SortBy.FolderThenNameAsc:
        return byFolderThenNameAscending;
      case Constants.SortBy.FolderThenNameDesc:
        return byFolderThenNameDescending;
      case Constants.SortBy.NameAsc:
        return byNameAscending;
      case Constants.SortBy.NameDesc:
        return byNameDescending;
      case Constants.SortBy.SizeAsc:
        return bySizeAscending;
      case Constants.SortBy.SizeDesc:
        return bySizeDescending;
      case Constants.SortBy.ModifiedAsc:
        return byFolderThenDateAscending;
      case Constants.SortBy.ModifiedDesc:
        return byFolderThenDateDescending;
      default:
        return byFolderThenNameAscending;
    }
  }  
};

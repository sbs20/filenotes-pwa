import Constants from './constants';

function byNameAscending(metadata1: IMetadata, metadata2: IMetadata): number {
  return metadata1.key.localeCompare(metadata2.key);
}

function byNameDescending(metadata1: IMetadata, metadata2: IMetadata): number {
  return byNameAscending(metadata1, metadata2) * -1;
}

function byFolderThenNameAscending(metadata1: IMetadata, metadata2: IMetadata): number {
  return metadata1.tag !== metadata2.tag
    ? -metadata1.tag.localeCompare(metadata2.tag)
    : metadata1.key.localeCompare(metadata2.key);
}

function byFolderThenNameDescending(metadata1: IMetadata, metadata2: IMetadata): number {
  return metadata1.tag !== metadata2.tag
    ? -metadata1.tag.localeCompare(metadata2.tag)
    : -metadata1.key.localeCompare(metadata2.key);
}

function byFolderThenDateAscending(metadata1: IMetadata, metadata2: IMetadata): number {
  return metadata1.tag !== metadata2.tag
    ? -metadata1.tag.localeCompare(metadata2.tag)
    : metadata1.modified && metadata2.modified
      ? metadata1.modified.localeCompare(metadata2.modified)
      : 0;
}

function byFolderThenDateDescending(metadata1: IMetadata, metadata2: IMetadata): number {
  return -byFolderThenDateAscending(metadata1, metadata2);
}

function bySizeAscending(metadata1: IMetadata, metadata2: IMetadata): number {
  return metadata1.tag !== metadata2.tag
    ? -metadata1.tag.localeCompare(metadata2.tag)
    : metadata1.size !== undefined && metadata2.size !== undefined
      ? metadata1.size - metadata2.size
      : 0;
}

function bySizeDescending(metadata1: IMetadata, metadata2: IMetadata): number {
  return -bySizeAscending(metadata1, metadata2);
}

export default {
  get(sortBy: string): (metadata1: IMetadata, metadata2: IMetadata) => number {
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

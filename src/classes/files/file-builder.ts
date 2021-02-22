import Context from '../context';
import Convert from '../utils/convert';
import FilePath from './file-path';

export default class FileBuilder {

  static path(metadata: IMetadata, path: string): IMetadata {
    const filepath = new FilePath(path);
    metadata.path = path;
    metadata.key = filepath.key;
    metadata.name = filepath.name;
    return metadata;
  }

  static data(metadata: IMetadata, data: ArrayBuffer): IMetadata {
    metadata.modified = new Date().toISOString();
    metadata.size = data.byteLength;
    metadata.hash = Context.instance().hash(data);
    return metadata;
  }

  static create(tag: Tag, path: string): IMetadata {
    return FileBuilder.path({
      tag: tag,
      path: '',
      key: '',
      name: ''
    }, path);
  }

  static file(path: string, data: ArrayBuffer): IMetadata {
    const metadata: IMetadata = FileBuilder.create('file', path);
    return FileBuilder.data(metadata, data);
  }

  static content(path: string, data: ArrayBuffer): IContent {
    const content: IContent = {
      key: path.toLowerCase(),
      data: data
    };

    if (FilePath.create(content.key).extension === 'txt') {
      content.preview = Convert.arrayBufferToString(data).substr(0, 50);
    }

    return content;
  }

  static deleted(path: string): IMetadata {
    return FileBuilder.create('deleted', path);
  }

  static folder(path: string): IMetadata {
    return FileBuilder.create('folder', path);
  }
}
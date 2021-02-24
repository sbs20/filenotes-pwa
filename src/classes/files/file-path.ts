export default class FilePath {
  path: string;

  /**
   * Constructor
   * @param {string} path 
   */
  constructor(path: string) {
    this.path = path;
  }

  /**
   * Returns the container directory
   * @returns {string}
   */
  get directory(): string {
    const path = this.path;
    if (path.indexOf('/') === -1) {
      return '';
    }
    const directory = path.substr(0, path.lastIndexOf('/'));
    return directory;
  }

  get extension(): string {
    const name = this.name;
    if (name.indexOf('.') === -1) {
      return '';
    }

    const extension = name.substr(name.lastIndexOf('.') + 1);
    return extension;
  }

  /**
   * Returns the filename
   */
  get name(): string {
    const name = this.path.split('/').slice(-1)[0];
    return name;
  }

  /**
   * Returns the filename stem (without the extension)
   */
  get stem(): string {
    const name = this.name;
    if (name.indexOf('.') === -1) {
      return name;
    }
    const stem = name.substr(0, name.lastIndexOf('.'));
    return stem;
  }

  /**
   * Returns the path key
   */
  get key(): string {
    const key = this.path.toLowerCase();
    return key;
  }

  get type(): FileType {
    switch (this.extension.toLowerCase()) {
      case 'csv':
      case 'md':
      case 'txt':
        return 'text';

      case 'jpg':
      case 'gif':
      case 'png':
        return 'image';

      case 'pdf':
        return 'pdf';

      case 'aac':
      case 'wav':
      case 'mp3':
        return 'audio';

      case 'todotxt':
      case 'todo':
      case 'td':
        return 'todotxt';

      default:
        return 'unknown';
    }
  }

  move(directory: string): FilePath {
    if (!directory.endsWith('/')) {
      directory += '/';
    }
    return new FilePath(`${directory}${this.name}`);
  }

  rename(name: string): FilePath {
    return new FilePath(`${this.directory}/${name}`);
  }

  static create(path: string): FilePath {
    return new FilePath(path);
  }

  static defaultExtension(type: FileType): string {
    switch (type) {
      case 'audio':
        return 'mp3';
      case 'image':
        return 'jpg';
      case 'text':
        return 'txt';
      case 'todotxt':
        return 'td';
      default:
        return 'unknown';
    }
  }
}
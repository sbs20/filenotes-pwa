export default class FilePath {
  /**
   * Constructor
   * @param {string} path 
   */
  constructor(path) {
    this.path = path;
  }

  /**
   * Returns the container directory
   * @returns {string}
   */
  get directory() {
    const path = this.path;
    if (path.indexOf('/') === -1) {
      return '';
    }
    const directory = path.substr(0, path.lastIndexOf('/'));
    return directory;
  }

  /**
   * Returns the file extension
   * @returns {string}
   */
  get extension() {
    const name = this.name;
    if (name.indexOf('.') === -1) {
      return '';
    }

    const extension = name.substr(name.lastIndexOf('.') + 1);
    return extension;
  }

  /**
   * Returns the filename
   * @returns {string}
   */
  get name() {
    const name = this.path.split('/').slice(-1)[0];
    return name;
  }

  /**
   * Returns the filename stem (without the extension)
   * @returns {string}
   */
  get stem() {
    const name = this.name;
    if (name.indexOf('.') === -1) {
      return name;
    }
    const stem = name.substr(0, name.lastIndexOf('.'));
    return stem;
  }

  /**
   * Returns the path key
   * @returns {string}
   */
  get key() {
    const key = this.path.toLowerCase();
    return key;
  }

  /**
   * Returns the type
   * @returns {FileType}
   */
  get type() {
    switch (this.extension.toLowerCase()) {
      case 'csv':
      case 'md':
      case 'txt':
        return 'text';

      case 'jpg':
      case 'gif':
      case 'png':
        return 'image';

      case 'aac':
      case 'wav':
      case 'mp3':
        return 'audio';

      default:
        return 'unknown';
    }
  }

  /**
   * @param {string} directory
   * @returns {FilePath}
   */
  move(directory) {
    if (!directory.endsWith('/')) {
      directory += '/';
    }
    return new FilePath(`${directory}${this.name}`);
  }

  /**
   * @param {string} name
   * @returns {FilePath}
   */
  rename(name) {
    return new FilePath(`${this.directory}/${name}`);
  }

  /**
   * Creates a filepath
   * @param {string} path 
   */
  static create(path) {
    return new FilePath(path);
  }

  /**
   * @param {FileType} type
   * @returns {string} The default extension without a preceding dot
   */
  static defaultExtension(type) {
    switch (type) {
      case 'text':
        return 'txt';
      case 'audio':
        return 'mp3';
      case 'image':
        return 'jpg';
      default:
        return 'unknown';
    }
  }
}
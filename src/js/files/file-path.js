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
    const directory = this.path.substr(0, this.path.lastIndexOf('/') + 1);
    return directory;
  }

  /**
   * Returns the file extension
   * @returns {string}
   */
  get extension() {
    const extension = this.name.substr(this.name.lastIndexOf('.') + 1);
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
    const stem = this.name.substr(0, this.name.lastIndexOf('.'));
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
   * Creates a filepath
   * @param {string} path 
   */
  static create(path) {
    return new FilePath(path);
  }
}
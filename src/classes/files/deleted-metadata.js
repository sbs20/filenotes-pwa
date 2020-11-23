import FolderMetadata from './folder-metadata';

export default class DeletedMetadata extends FolderMetadata {

  /**
   * Constructor
   */
  constructor() {
    super();
    this.assign({
      tag: 'deleted'
    });
  }

  /**
   * Creates a deletion stub
   * @param {string} path - The path
   * @returns {Metadata}
   */
  static create(path) {
    return new DeletedMetadata().path(path).value;
  }
}
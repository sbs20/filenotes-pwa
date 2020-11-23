const _data = Symbol();

export default class BaseMetadata {
  /**
   * Constructor
   */
  constructor() {
    this[_data] = {};
  }

  /**
   * Assigns an object to this
   * @param {any} o - Object to assign
   * @returns BaseMetadata
   */
  assign(o) {
    Object.assign(this[_data], o);
    return this;
  }

  /**
   * Returns the value
   * @returns {any}
   */
  get value() {
    return this[_data];
  }
}

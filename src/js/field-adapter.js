export default class FieldAdapter {
  constructor(mapping) {
    this.to = mapping;
    this.from = Object.keys(this.to).reduce((acc, key) => {
      acc[this.to[key]] = key
      return acc;
    }, {});
  }

  static _apply(mapping, input) {
    return Object.keys(input).reduce((output, key) => {
      if (key in mapping) {
        output[mapping[key]] = input[key];
      }
      return output;
    }, {});
  }

  /**
   * Applies mapping
   * @param {Object} input 
   * @returns {Object} output
   */
  apply(input) {
    return FieldAdapter._apply(this.to, input);
  }
  
  /**
   * Unapplies mapping
   * @param {Object} input 
   * @returns {Object} output
   */
  unapply(input) {
    return FieldAdapter._apply(this.from, input);
  }
}

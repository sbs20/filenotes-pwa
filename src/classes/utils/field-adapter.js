function _apply(mapping, input) {
  return Object.keys(input).reduce((output, key) => {
    if (key in mapping) {
      output[mapping[key]] = input[key];
    }
    return output;
  }, {});
}

export default class FieldAdapter {
  constructor(mapping) {
    this.to = mapping;
    this.from = Object.keys(this.to).reduce((acc, key) => {
      acc[this.to[key]] = key;
      return acc;
    }, {});
  }

  /**
   * Applies mapping
   * @param {Object} input 
   * @returns {Object} output
   */
  apply(input) {
    return _apply(this.to, input);
  }
  
  /**
   * Unapplies mapping
   * @param {Object} input 
   * @returns {Object} output
   */
  unapply(input) {
    return _apply(this.from, input);
  }
}


function _apply(mapping: Dictionary<string>, input: any): any {
  return Object.keys(input).reduce<any>((output, key) => {
    if (key in mapping) {
      output[mapping[key]] = input[key];
    }
    return output;
  }, {});
}

export default class FieldAdapter<T> {
  from: Dictionary<string>;
  to: Dictionary<string>;

  constructor(mapping: Dictionary<string>) {
    this.to = mapping;
    this.from = Object.keys(this.to).reduce<any>((acc, key) => {
      acc[this.to[key]] = key;
      return acc;
    }, {});
  }

  /**
   * Applies mapping
   */
  apply(input: object): T {
    return _apply(this.to, input);
  }
  
  /**
   * Unapplies mapping
   */
  unapply(input: T): object {
    return _apply(this.from, input);
  }
}

export default class FieldAdapter {
  constructor(mapping) {
    this.toLocal = mapping;
    this.toRemote = Object.keys(this.toLocal).reduce((acc, key) => {
      acc[this.toLocal[key]] = key
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

  asLocal(input) {
    return FieldAdapter._apply(this.toLocal, input);
  }
  
  asRemote(input) {
    return FieldAdapter._apply(this.toRemote, input);
  }
}

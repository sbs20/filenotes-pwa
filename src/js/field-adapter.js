export default class FieldAdapter {
  constructor(mapping) {
    this.toLocal = mapping;
    this.toRemote = Object.keys(this.toLocal).reduce((acc, key) => {
      acc[this.toLocal[key]] = key
      return acc;
    }, {});
  }

  static _as(mapping, input) {
    return Object.keys(input).reduce((output, key) => {
      output[mapping[key]] = input[key];
      return output;
    }, {});
  }

  asLocal(input) {
    return FieldAdapter._as(this.toLocal, input);
  }
  
  asRemote(input) {
    return FieldAdapter._as(this.toRemote, input);
  }
}

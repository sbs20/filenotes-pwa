export default {
  parse(search: string): IDictionary<String | null | (string | null)[]> {
    const obj = Object.create(null);

    if (typeof search !== 'string') {
      return obj;
    }

    search = search.trim().replace(/^(\?|#|&)/, '');

    if (!search) {
      return obj;
    }

    search.split('&').forEach((param) => {
      const parts = param.replace(/\+/g, ' ').split('=');
      // Firefox (pre 40) decodes `%3D` to `=`
      // https://github.com/sindresorhus/query-string/pull/37
      let key = parts.shift();
      let val: string | undefined | null = parts.length > 0 ? parts.join('=') : undefined;

      key = decodeURIComponent(key as string);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (obj[key] === undefined) {
        obj[key] = val;
      } else if (Array.isArray(obj[key])) {
        obj[key].push(val);
      } else {
        obj[key] = [obj[key], val];
      }
    });

    return obj;
  }
};

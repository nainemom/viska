// it should require once!

const store = {};

const generateStrKey = (obj) => Object.keys(obj).sort().map((key) => `${key}:${obj[key]}`).join(',');

module.exports = (names) => {
  const generate = (name) => {
    store[name] = new Map();
    return {
      _store: store[name],
      set(key, data) {
        store[name].set(generateStrKey(key), data);
        return {
          ...key,
          ...data,
        }
      },
      get(key) {
        return store[name].get(generateStrKey(key));
      },
      delete(key) {
        return store[name].delete(generateStrKey(key));
      },
    }
  }

  const ret = {};
  names.forEach((name) => {
    ret[name] = generate(name);
  });
  return ret;
};

// it should require once!

const store = {};

const generateStrKey = (obj) => Object.keys(obj).sort().map((key) => `${key}:${obj[key]}`).join(',');

const create = (name) => {
  store[name] = new Map();
  return {
    _store: store[name],
    set(key, data) {
      store[name].set(generateStrKey(key), data);
    },
    put(key, data) {
      const strKey = generateStrKey(key);
      store[name].set(strKey, [
        ...(store[name].get(strKey) || []),
        data
      ]);
    },
    get(key) {
      return store[name].get(generateStrKey(key));
    },
    delete(key) {
      return store[name].delete(generateStrKey(key));
    },
  }
}

module.exports = {
  create,
}
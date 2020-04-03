// it should require once!

const store = {};

const create = (name) => {
  store[name] = [];
  return {
    _store: store[name],
    insert(document) {
      store[name].push(document);
    },
    find(searchObj) {
      const searchKeys = Object.keys(searchObj);
      for(let i = 0; i < store[name].length; i++) {
        const document = store[name][i];
        let match = true;
        for(let j = 0; j < searchKeys.length; j++) {
          const searchKey = searchKeys[j];
          if (document[searchKey] !== searchObj[searchKey]) {
            match = false;
            break;
          }
        }
        if (match) {
          return document;
        }
      }
      return undefined;
    },
    delete(searchObj) {
      const searchKeys = Object.keys(searchObj);
      let length = store[name].length
      for(let i = 0; i < length; i++) {
        const document = store[name][i];
        let match = true;
        for(let j = 0; j < searchKeys.length; j++) {
          const searchKey = searchKeys[j];
          if (document[searchKey] !== searchObj[searchKey]) {
            match = false;
            break;
          }
        }
        if (match) {
          store[name].splice(i, 1);
          i--;
          length--;
        }
      }
    }
  }
}

module.exports = {
  create,
}
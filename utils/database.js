const loki = require('lokijs');
const LokiIndexedAdabter = require('lokijs/src/loki-indexed-adapter.js');
console.log(LokiIndexedAdabter);

module.exports = ({
  path,
  regenerate = false,
  browser = false,
  collections = [],
}) => {
  return new Promise((resolve) => {
    const loadCollection = (_db) => (collectionName) => {
      const collection = _db.getCollection(collectionName) || _db.addCollection(collectionName);
  
      const insert = (document) => {
        return collection.insert(document);
      };
  
      const find = (searchHandler) => {
        return collection.where(searchHandler);
      };

      const remove = (documentOrSearchHandler) => {
        if (typeof documentOrSearchHandler === 'function') {
          return collection.removeWhere(documentOrSearchHandler);
        }
        return collection.remove(documentOrSearchHandler);
      };
  
      const update = (documentOrSearchHandler, updateHandler) => {
        if (typeof documentOrSearchHandler === 'function') {
          return collection.updateWhere(documentOrSearchHandler, updateHandler);
        }
        return collection.update(documentOrSearchHandler);
      };
      
      return {
        insert,
        find,
        remove,
        update,
      };
    };

    
    let db;
    const onLoad = () => {
      const ret = {};
      collections.forEach((collectionName) => {
        ret[collectionName] = loadCollection(db)(collectionName);
      })
      resolve(ret);
    }

    const config = {};

    if (!regenerate) {
      config.autosave = true;
      config.autosaveInterval = 60000;
      config.autoload = true;
      config.autoloadCallback = onLoad;
    }

    if (browser) {
      config.adapter = new LokiIndexedAdabter();
    }

    db = new loki(path, config);
    if (regenerate) {
      onLoad();
    }
  });
};
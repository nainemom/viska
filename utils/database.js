const loki = require('lokijs');
const LokiIndexedAdabter = require('lokijs/src/loki-indexed-adapter.js');

module.exports = ({
  name,
  memory = false,
  browser = false,
  syncToCloud = false,
  collections = [],
}) => {
  return new Promise((resolve) => {
    const loadCollection = (_db) => (collectionName) => {
      const collection = _db.getCollection(collectionName) || _db.addCollection(collectionName);
  
      const insert = (document) => {
        setTimeout(save);
        return collection.insert(document);
      };
  
      const find = (searchHandler) => {
        return collection.where(searchHandler);
      };

      const remove = (documentOrSearchHandler) => {
        if (typeof documentOrSearchHandler === 'function') {
          return collection.removeWhere(documentOrSearchHandler);
        }
        setTimeout(save);
        return collection.remove(documentOrSearchHandler);
      };
  
      const update = (documentOrSearchHandler, updateHandler) => {
        if (typeof documentOrSearchHandler === 'function') {
          return collection.updateWhere(documentOrSearchHandler, updateHandler);
        }
        setTimeout(save);
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

    let saveToCloudTimeout = null;
    const saveToCloud = () => {
      clearTimeout(saveToCloudTimeout);
      saveToCloudTimeout = setTimeout(() => {
        // SAVE TO CLOUD
      }, 10000);
      return true;
    }

    const loadFromCloud = () => {
      return new Promise((resolve, reject) => {
        // LOAD FROM CLOUD TO path
        resolve();
      });
    }

    const save = () => {
      db && !memory && db.save();
      db && !memory && syncToCloud && saveToCloud();
    }

    const config = {};

    if (!memory) {
      config.autoload = true;
      config.autoloadCallback = onLoad;
    }

    if (browser) {
      config.adapter = new LokiIndexedAdabter();
    }

    loadFromCloud().then(() => {
      db = new loki(name, config);
      if (memory) {
        onLoad();
      }
    });
  });
};
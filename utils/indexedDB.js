import { openDB } from 'idb';



export default ({
  name = 'db',
  version = 1,
  prefix = 'prefix',
  dynamicCollections = [],
  staticCollections = [],
}) => {
  const collections = [
    ...dynamicCollections,
    ...staticCollections,
  ];
  const isDynamic = (collection) => dynamicCollections.includes(collection);

  const dbPromise = new Promise((resolve) => {
    openDB(name, version, {
      upgrade(db) {
        collections.forEach((collection) => {
          if (db.objectStoreNames.contains(collection)) {
            // react on version change
          } else {
            db.createObjectStore(collection);
          }
        });
      },
    }).then(resolve).catch(() => {
      // it seems the browser doesn't support indexedDB, so we gonna use localStorage with same idb api
      const get = (collection, key) => {
        const data = localStorage.getItem(`${name}@${version}:${collection}.${key}`);
        return Promise.resolve(!data ? undefined : JSON.parse(data));
      }
      const put = (collection, value, key) => {
        localStorage.setItem(`${name}@${version}:${collection}.${key}`, JSON.stringify(value));
        return Promise.resolve();
      }
      const clear = (collection, key) => {
        localStorage.removeItem(`${name}@${version}:${collection}.${key}`);
        return Promise.resolve();
      }
      resolve({
        get,
        put,
        clear,
      });
    });
  });

  const initCollection = (collection) => {
    const get = () => dbPromise.then((db) => db.get(collection, isDynamic(collection) ? prefix : 'root'));
    const set = (val) => dbPromise.then((db) => db.put(collection, val, isDynamic(collection) ? prefix : 'root'));
    const clear = () => dbPromise.then((db) => db.clear(collection, isDynamic(collection) ? prefix : 'root'));

    return {
      get,
      set,
      clear,
    }
  }


  const ret = {};
  collections.forEach((collection) => {
    ret[collection] = initCollection(collection);
  });

  return ret;
}

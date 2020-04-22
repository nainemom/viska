import { openDB, deleteDB } from 'idb';

// migrating from loki. should be remove later.
// TODO remove this shit
const loadLokiData = (uname, deleteAfter) => new Promise((_resolve) => {
  openDB('LokiCatalog', 1).then((oldDb) => {
    oldDb.get('LokiAKV', 1).then((data) => {
      const dt = data.val ? JSON.parse(data.val) : {};
      // really bad, stupid and dangerious way.
      if (dt.filename.includes(uname) && dt.collections && dt.collections.length) {
        const chats = dt.collections[0].data.map((_chat) => ({
          badge: _chat.badge,
          isOnline: null,
          messages: _chat.messages,
          user: _chat.user,
        }));
        _resolve(chats);
        deleteAfter && deleteDB('LokiCatalog');
      }
    }).catch(() => _resolve([]));
  }).catch(() => _resolve([]));
});

export default ({
  name = 'db',
  version = 1,
  prefix = '',
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
      async upgrade(db) {
        collections.forEach((collection) => {
          if (!db.objectStoreNames.contains(collection)) {
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
    const set = (val) => dbPromise.then((db) => db.put(collection, val, isDynamic(collection) ? prefix : 'root'));
    const get = () => {
      // TODO also remove this shit (if{} block)
      if (collection === 'chats' && prefix) {
        return new Promise(_resolve => {
          loadLokiData(prefix.substr(1), true).then((oldChats) => {
            dbPromise.then((db) => db.get(collection, isDynamic(collection) ? prefix : 'root')).then((newChats) => {
              const parsedDt = [
                ...(newChats || []),
                ...oldChats,
              ].filter((_chat, i, h) => h.findIndex((__chat) => __chat.user.username === _chat.user.username) === i)
              set(parsedDt).then(() => {
                _resolve(parsedDt);
              });
            })
          });
        });
      }
      dbPromise.then((db) => db.get(collection, isDynamic(collection) ? prefix : 'root'));
    }
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

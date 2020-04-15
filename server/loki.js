const path = require('path');
const initLoki = require(path.resolve(__dirname, '../utils/loki.js'));

module.exports = () => {
  return initLoki({
    name: 'memDb',
    memory: true,
    collections: [
      'activeUsers',
    ],
  });
}

const { pbkdf2Sync } = require('crypto');

const generateKey = (passphrase, salt) => {
  return pbkdf2Sync(passphrase, salt, 100000, 128, 'sha512').toString('hex');
}

module.exports.generateKey = generateKey;
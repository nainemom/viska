const { pbkdf2Sync } = require('crypto');

export const generateKey = (passphrase, salt) => pbkdf2Sync(passphrase, salt, 10000, 32, 'sha512').toString('hex');

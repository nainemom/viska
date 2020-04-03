const ab2str = (buf) => {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
};

const str2ab = (str) => {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  const bufView = new Uint16Array(buf);
  const strLen = str.length;
  for (let i = 0; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

const algorithm = {
  name: 'RSA-OAEP',
  modulusLength: 1024,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

export const supportCheck = () => {
  return 'crypto' in window;
};

export const generateDecrypter = () => new Promise((resolve) => {
  window.crypto.subtle.generateKey(
    algorithm,
    true,
    ['encrypt', 'decrypt'],
  ).then((keyPair) => {
    window.crypto.subtle.exportKey(
      'spki',
      keyPair.publicKey,
    ).then((res) => ab2str(res)).then((publicKey) => {
      resolve({
        publicKey,
        decrypt: (data) => window.crypto.subtle.decrypt(algorithm, keyPair.privateKey, str2ab(data)).then(res => ab2str(res)),
      })
    });
  });
});

export const generateEncrypter = (publicKey) => new Promise((resolve) => {
  window.crypto.subtle.importKey(
    'spki',
    str2ab(publicKey),
    algorithm,
    true,
    ['encrypt']
  ).then((publicKeySubtle) => {
    resolve({
      encrypt: (data) => window.crypto.subtle.encrypt(algorithm, publicKeySubtle, str2ab(data)).then((res) => ab2str(res)),
    })
  });
});

import { CryptorKey, CryptorPairKeys } from '@/types';
import {
  ENCRYPTION_ALGORITHM_NAME,
  ENCRYPTION_MODULES_LENGTH,
  ENCRYPTION_PUBLIC_KEY_TYPE,
  ENCRYPTION_PRIVATE_KEY_TYPE,
  ENCRYPTION_HASH_TYPE,
} from '@/constants';

const ab2str = (buf: ArrayBuffer): string => {
  const bufView = new Uint8Array(buf);
  return [...Array(bufView.length)].map((_, index) => {
    return String.fromCharCode(bufView[index]);
  }).join('');
}

const str2ab = (str: string): ArrayBuffer => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  [...Array(str.length)].forEach((_, index) => {
    bufView[index] = str.charCodeAt(index);
  });
  return buf;
}

const algorithm: RsaHashedKeyGenParams = {
  name: ENCRYPTION_ALGORITHM_NAME,
  modulusLength: ENCRYPTION_MODULES_LENGTH,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: ENCRYPTION_HASH_TYPE,
};

export const generatePairKeys = async () : Promise<CryptorPairKeys> => {
  const keyPair = await crypto.subtle.generateKey(
    algorithm,
    true,
    ['encrypt', 'decrypt'],
  );
  const [publicBuffer, privateBuffer] = await Promise.all([
    crypto.subtle.exportKey(ENCRYPTION_PUBLIC_KEY_TYPE, keyPair.publicKey),
    crypto.subtle.exportKey(ENCRYPTION_PRIVATE_KEY_TYPE, keyPair.privateKey),
  ]);
  const publicKey = btoa(ab2str(publicBuffer));
  const privateKey = btoa(ab2str(privateBuffer));
  return {
    publicKey,
    privateKey,
  };
}

export const decrypt = async (message: string, privateKey: CryptorKey): Promise<string> => {
  const keyObject = await crypto.subtle.importKey(
    ENCRYPTION_PRIVATE_KEY_TYPE,
    str2ab(atob(privateKey)),
    algorithm,
    false,
    ['decrypt']
  );
  return ab2str(
    await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      keyObject,
      str2ab(atob(message)),
    ),
  );
}

export const encrypt = async (message: string, publicKey: CryptorKey): Promise<string> => {
  if (message.length > 190) throw new Error('Maximum length of encrypting message is 190');
  const keyObject = await crypto.subtle.importKey(
    ENCRYPTION_PUBLIC_KEY_TYPE,
    str2ab(atob(publicKey)),
    algorithm,
    false,
    ['encrypt']
  );
  return btoa(ab2str(
    await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      keyObject,
      str2ab(message),
    ),
  ));
}

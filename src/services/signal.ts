import { CryptorPairKeys, Signal, SignalServerConfig } from '@/types';
import { decrypt, encrypt } from '@/services/cryptor';

let signalServer: WebSocket | null;
let isAuthorized: boolean = false;

const getSignalServerUrlHref = (pairKeys: CryptorPairKeys, config: SignalServerConfig): string => {
  const url = new URL(config.url);
  url.searchParams.append('pub', pairKeys.publicKey);
  if (config.pin) {
    url.searchParams.append('pin', config.pin);
  }
  return url.href;
}

export const send = (signal: Signal) => {
  if (!signalServer || signalServer?.readyState !== signalServer.OPEN || !isAuthorized) {
    throw new Error('Signal server is down.');
  }
  signalServer.send(JSON.stringify(signal));
}

export const connect = (
  pairKeys: CryptorPairKeys,
  config: SignalServerConfig,
): Promise<WebSocket> => new Promise((resolve, reject) => {
  isAuthorized = false;
  signalServer = new WebSocket(getSignalServerUrlHref(pairKeys, config));
  signalServer.addEventListener('close', () => {
    if (!signalServer) {
      return;
    }
    if (!isAuthorized) {
      signalServer = null;
      return reject();
    }
    return signalServer.dispatchEvent(new CustomEvent(`signal:close`));
  });
  signalServer.addEventListener('message', async (event) => {
    if (!signalServer) {
      return;
    }
    if (!isAuthorized) {
      console.log(event.data);
      if (typeof event.data === 'string' && event.data.length) {
        try {
          const decryptedData = await decrypt(event.data, pairKeys.privateKey);
          return signalServer.send(decryptedData);
        } catch (_e) {
          console.log('cannot dec', _e);
          console.log('but let me test', '37aac9d8-1eaa-4ff2-8cd2-517365c7b855');
          const enc = await encrypt('37aac9d8-1eaa-4ff2-8cd2-517365c7b855', pairKeys.publicKey);
          console.log('my enc');
          console.log(enc);
          console.log('my dec');
          console.log(await decrypt(enc, pairKeys.privateKey));
          return reject();
        }
      } else {
        console.log('ennnnd');
        isAuthorized = true;
        resolve(signalServer);
        return signalServer.dispatchEvent(new CustomEvent(`signal:open`));
      }
    }
    const signal: Signal = JSON.parse(event.data);
    return signalServer.dispatchEvent(new CustomEvent(`signal:${signal.type}`, {
      detail: signal,
    }));
  });
});


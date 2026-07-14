/**
 * The client WebSocket connection, as a closure-backed factory (no classes).
 *
 * It drives the JSON handshake the server expects (hello → challenge → auth →
 * [conflict → takeover] → ready), then exposes high-level actions: probe
 * presence, subscribe to push, and send an end-to-end encrypted message. All
 * encryption/decryption happens here; plaintext never touches the wire.
 *
 * Since an address IS a public key, there is no key lookup: to message a peer
 * you already hold their key (it is their address), and an incoming message's
 * `from` is the sender's key.
 */

import {
  base64urlToBytes,
  bytesToBase64url,
  type ClientMsg,
  crypto,
  type EncryptedPayload,
  type ErrorCode,
  type PushSubscriptionJson,
  type SealedBox,
  type ServerMsg,
} from '../shared/index.ts';
import type { Identity } from './identity.ts';

export type ConnectionStatus = 'connecting' | 'online' | 'offline';

export interface IncomingMessage {
  /** The sender's address (public key). */
  from: string;
  body: string;
  id: string;
}

export interface ConnectionHandlers {
  onStatus?: (status: ConnectionStatus) => void;
  onMessage?: (message: IncomingMessage) => void;
  onPresence?: (address: string, online: boolean) => void;
  /** Another device holds this address; call confirmTakeover() to seize it. */
  onConflict?: () => void;
  /** This session was seized by another device. */
  onKicked?: () => void;
  /** A handshake failure. */
  onError?: (code: ErrorCode, message: string) => void;
}

export interface ViskaConnection {
  handlers: ConnectionHandlers;
  connect(): void;
  disconnect(): void;
  /** After onConflict, confirm disconnecting the other device. */
  confirmTakeover(): void;
  probePresence(address: string): void;
  subscribePush(subscription: PushSubscriptionJson): void;
  sendMessage(toAddress: string, body: string): Promise<string>;
}

export function createConnection(
  url: string,
  identity: Identity,
): ViskaConnection {
  let ws: WebSocket | undefined;
  let manualClose = false;
  let hasConnected = false;

  const setStatus = (status: ConnectionStatus): void =>
    conn.handlers.onStatus?.(status);

  function send(msg: ClientMsg): void {
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
  }

  async function onServerMsg(msg: ServerMsg): Promise<void> {
    switch (msg.t) {
      case 'challenge': {
        const nonce = await crypto.openSeal(
          identity.privateKey,
          msg.box as SealedBox,
        );
        send({ t: 'auth', response: bytesToBase64url(nonce) });
        return;
      }
      case 'conflict':
        // A stale ghost of our own session (reconnect race) — just seize it.
        // A genuine second device asks the user first.
        if (hasConnected) conn.confirmTakeover();
        else conn.handlers.onConflict?.();
        return;
      case 'ready':
        hasConnected = true;
        setStatus('online');
        return;
      case 'kicked':
        manualClose = true;
        conn.handlers.onKicked?.();
        ws?.close();
        return;
      case 'error':
        manualClose = true; // don't retry a rejected handshake
        conn.handlers.onError?.(msg.code, msg.message);
        ws?.close();
        return;
      case 'msg':
        return void onMessage(msg.from, msg.id, msg.enc);
      case 'presence':
        conn.handlers.onPresence?.(msg.address, msg.online);
        return;
    }
  }

  async function onMessage(
    from: string,
    id: string,
    enc: EncryptedPayload,
  ): Promise<void> {
    const key = await crypto.deriveConversationKey(
      identity.privateKey,
      base64urlToBytes(from), // the sender's address is their public key
      identity.address,
      from,
    );
    let body: string;
    try {
      body = await crypto.decrypt(key, enc);
    } catch {
      return; // undecryptable / tampered
    }
    conn.handlers.onMessage?.({ from, body, id });
  }

  function connect(): void {
    manualClose = false;
    setStatus('connecting');
    const socket = new WebSocket(url);
    ws = socket;
    socket.addEventListener('open', () =>
      send({ t: 'hello', publicKey: identity.address }),
    );
    socket.addEventListener('message', (event) => {
      let msg: ServerMsg;
      try {
        msg = JSON.parse(String(event.data)) as ServerMsg;
      } catch {
        return;
      }
      void onServerMsg(msg);
    });
    socket.addEventListener('close', () => onClose());
    socket.addEventListener('error', () => socket.close());
  }

  function disconnect(): void {
    manualClose = true;
    ws?.close();
  }

  function confirmTakeover(): void {
    send({ t: 'takeover' });
  }

  function onClose(): void {
    setStatus('offline');
    if (!manualClose) {
      setTimeout(() => {
        if (!manualClose) connect();
      }, 2000);
    }
  }

  function probePresence(address: string): void {
    send({ t: 'probe', address });
  }

  function subscribePush(subscription: PushSubscriptionJson): void {
    send({ t: 'push', subscription });
  }

  async function sendMessage(toAddress: string, body: string): Promise<string> {
    const key = await crypto.deriveConversationKey(
      identity.privateKey,
      base64urlToBytes(toAddress), // the peer's address is their public key
      identity.address,
      toAddress,
    );
    const enc = await crypto.encrypt(key, body);
    const id = crypto.randomId();
    send({ t: 'msg', to: toAddress, id, enc });
    return id;
  }

  const conn: ViskaConnection = {
    handlers: {},
    connect,
    disconnect,
    confirmTakeover,
    probePresence,
    subscribePush,
    sendMessage,
  };
  return conn;
}

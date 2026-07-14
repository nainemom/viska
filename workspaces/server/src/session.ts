/**
 * One session per WebSocket connection, expressed as a factory function that
 * closes over the connection's mutable state (no classes).
 *
 * Handshake it drives:
 *
 *   hello  ->  challenge -> auth        prove ownership of the presented key
 *   [conflict -> takeover]              enforce one device per address
 *   ready                              bound; queued offline messages flushed
 *   active                             route msg / probe / push
 *
 * The address a session binds is exactly the public key it proved it owns, so
 * the server stamps a verified `from` on every routed message and no client can
 * speak for an address it doesn't hold.
 */

import type { WebSocket } from 'ws';
import { WebSocket as WsWebSocket } from 'ws';
import { createChallenge, verifyResponse } from './auth.ts';
import { drainOffline, enqueueOffline, savePushSubscription } from './db.ts';
import type { Device, Hub } from './hub.ts';
import { notifyOffline } from './push.ts';
import {
  base64urlToBytes,
  type ClientMsg,
  crypto,
  type EncryptedPayload,
  type ErrorCode,
} from './shared/index.ts';

type State =
  | 'hello'
  | 'awaiting-auth'
  | 'awaiting-takeover'
  | 'active'
  | 'closed';

export function createSession(ws: WebSocket, hub: Hub): void {
  let state: State = 'hello';
  let address = '';
  let pendingNonce: Uint8Array | undefined;

  const device: Device = {
    send: (msg) => {
      if (ws.readyState === WsWebSocket.OPEN) ws.send(JSON.stringify(msg));
    },
    kick: () => {
      device.send({ t: 'kicked' });
      teardown();
      try {
        ws.close();
      } catch {
        // ignore
      }
    },
  };

  function fail(code: ErrorCode, message: string): void {
    device.send({ t: 'error', code, message });
    teardown();
    try {
      ws.close();
    } catch {
      // ignore
    }
  }

  // --- handshake -----------------------------------------------------------

  async function handleHello(publicKey: string): Promise<void> {
    try {
      await crypto.importPublicKeyRaw(base64urlToBytes(publicKey)); // validate
    } catch {
      return fail('bad-request', 'Invalid public key.');
    }
    address = publicKey;
    const { nonce, box } = await createChallenge(base64urlToBytes(publicKey));
    pendingNonce = nonce;
    state = 'awaiting-auth';
    device.send({ t: 'challenge', box });
  }

  function handleAuth(response: string): void {
    let bytes: Uint8Array;
    try {
      bytes = base64urlToBytes(response);
    } catch {
      fail('auth-failed', 'Malformed response.');
      return;
    }
    if (!pendingNonce || !verifyResponse(pendingNonce, bytes)) {
      fail('auth-failed', 'Challenge failed.');
      return;
    }
    pendingNonce = undefined;
    if (hub.online(address)) {
      state = 'awaiting-takeover';
      device.send({ t: 'conflict' });
    } else {
      void bindAndReady();
    }
  }

  function handleTakeover(): void {
    hub.deviceOf(address)?.kick();
    void bindAndReady();
  }

  async function bindAndReady(): Promise<void> {
    hub.bind(address, device);
    state = 'active';
    device.send({ t: 'ready', address });
    for (const payload of await drainOffline(address)) {
      try {
        const { from, id, enc } = JSON.parse(payload) as {
          from: string;
          id: string;
          enc: EncryptedPayload;
        };
        device.send({ t: 'msg', from, id, enc });
      } catch {
        // skip anything that no longer parses
      }
    }
  }

  // --- active-state routing ------------------------------------------------

  async function handleMsg(to: string, id: string, enc: EncryptedPayload) {
    if (hub.deliver(to, { t: 'msg', from: address, id, enc })) return;
    await enqueueOffline(to, JSON.stringify({ from: address, id, enc }));
    void notifyOffline(to);
  }

  async function routeActive(msg: ClientMsg): Promise<void> {
    switch (msg.t) {
      case 'msg':
        return handleMsg(msg.to, msg.id, msg.enc);
      case 'probe':
        return device.send({
          t: 'presence',
          address: msg.address,
          online: hub.online(msg.address),
        });
      case 'push':
        return savePushSubscription(address, msg.subscription);
    }
  }

  // --- frame dispatch ------------------------------------------------------

  async function handleFrame(raw: string): Promise<void> {
    let msg: ClientMsg;
    try {
      msg = JSON.parse(raw) as ClientMsg;
    } catch {
      return; // ignore malformed frames
    }
    if (!msg || typeof msg.t !== 'string') return;

    switch (state) {
      case 'hello':
        if (msg.t === 'hello') await handleHello(msg.publicKey);
        return;
      case 'awaiting-auth':
        if (msg.t === 'auth') handleAuth(msg.response);
        return;
      case 'awaiting-takeover':
        if (msg.t === 'takeover') handleTakeover();
        return;
      case 'active':
        await routeActive(msg);
        return;
      case 'closed':
        return;
    }
  }

  // --- teardown ------------------------------------------------------------

  function teardown(): void {
    if (state === 'closed') return;
    const wasBound = state === 'active';
    state = 'closed';
    if (wasBound && address) hub.unbind(address, device);
  }

  ws.on('message', (data) => void handleFrame(data.toString()));
  ws.on('close', teardown);
  ws.on('error', teardown);
}

/**
 * The Viska wire protocol: plain JSON objects sent as WebSocket text frames,
 * each tagged with a `t` discriminant.
 *
 * Handshake:
 *   client -> hello       presents its raw public key (which is its address)
 *   server -> challenge   a nonce sealed (ECIES) to that public key
 *   client -> auth        the decrypted nonce, proving key ownership
 *   server -> conflict    (only if that address already has a device)
 *   client -> takeover    confirm kicking the other device
 *   server -> ready       authenticated and bound; queued messages follow
 *
 * There is no login/signup, no username, and no key directory: the address is
 * the key, so anyone who has your address can already encrypt to you. The
 * server is a pure relay (+ offline queue + push).
 */

import type {
  EncryptedPayload,
  PushSubscriptionJson,
  SealedBox,
} from './types.ts';

export type ClientMsg =
  /** Announce the public key (address) this connection wants to bind. */
  | { t: 'hello'; publicKey: string }
  /** Answer to the sealed challenge: the recovered nonce, base64url. */
  | { t: 'auth'; response: string }
  /** Confirm disconnecting this address's other active device. */
  | { t: 'takeover' }
  /** Send an end-to-end encrypted message to a peer address. */
  | { t: 'msg'; to: string; id: string; enc: EncryptedPayload }
  /** Ask whether an address currently has a connected device. */
  | { t: 'probe'; address: string }
  /** Register this device for offline Web Push notifications. */
  | { t: 'push'; subscription: PushSubscriptionJson };

/** Reasons a handshake can fail. */
export type ErrorCode = 'auth-failed' | 'bad-request';

export type ServerMsg =
  /** Prove you hold the private key by opening this sealed nonce. */
  | { t: 'challenge'; box: SealedBox }
  /** This address already has a connected device; send `takeover` to proceed. */
  | { t: 'conflict' }
  /** Authenticated and bound. Queued offline messages follow. */
  | { t: 'ready'; address: string }
  /** Another device took over this address; this session is closing. */
  | { t: 'kicked' }
  /** The handshake failed. */
  | { t: 'error'; code: ErrorCode; message: string }
  /** An incoming end-to-end encrypted message. `from` is the sender's address
   * (public key), which the recipient uses to derive the shared key. */
  | { t: 'msg'; from: string; id: string; enc: EncryptedPayload }
  /** Presence answer to a `probe`. */
  | { t: 'presence'; address: string; online: boolean };

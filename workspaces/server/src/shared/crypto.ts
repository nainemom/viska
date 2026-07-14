/**
 * All cryptography lives here, using only the Web Crypto API (`crypto.subtle`),
 * which is present in modern browsers and Node >= 20. The module is imported by
 * both sides:
 *
 *  - The client generates its identity key, derives conversation keys, and
 *    encrypts/decrypts messages. Private keys never leave the browser.
 *  - The server only uses `seal()` to build an auth challenge; it holds no
 *    identity key and never sees message plaintext.
 *
 * Primitives: ECDH on P-256 for key agreement, HKDF-SHA256 to turn a shared
 * secret into an AES key, and AES-256-GCM for authenticated encryption.
 */

import { AUTH_KDF_INFO } from './constants.ts';
import {
  base64urlToBytes,
  bytesToBase64url,
  bytesToUtf8,
  utf8ToBytes,
} from './encoding.ts';
import type { EncryptedPayload, SealedBox } from './types.ts';

const ECDH_PARAMS: EcKeyGenParams = { name: 'ECDH', namedCurve: 'P-256' };

// --- identity key material -------------------------------------------------

/** Create a fresh ECDH identity key pair. */
export function generateIdentity(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(ECDH_PARAMS, true, ['deriveBits']);
}

export async function exportPublicKeyRaw(key: CryptoKey): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.exportKey('raw', key));
}

export function importPublicKeyRaw(raw: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    raw as BufferSource,
    ECDH_PARAMS,
    true,
    [],
  );
}

/** Export a private key as a JWK object for persistence (e.g. localStorage). */
export function exportPrivateKeyJwk(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey('jwk', key);
}

export function importPrivateKeyJwk(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey('jwk', jwk, ECDH_PARAMS, true, ['deriveBits']);
}

/** Recover the raw public key from a stored private-key JWK (which carries the
 * public coordinates x/y). Lets the client persist a single JWK and rebuild its
 * public key / JID on load. */
export async function publicKeyRawFromJwk(
  jwk: JsonWebKey,
): Promise<Uint8Array> {
  const publicJwk: JsonWebKey = {
    kty: jwk.kty,
    crv: jwk.crv,
    x: jwk.x,
    y: jwk.y,
  };
  const publicKey = await crypto.subtle.importKey(
    'jwk',
    publicJwk,
    ECDH_PARAMS,
    true,
    [],
  );
  return exportPublicKeyRaw(publicKey);
}

// --- shared-secret derivation ----------------------------------------------

async function deriveAesKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey,
  info: string,
): Promise<CryptoKey> {
  const bits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: publicKey },
    privateKey,
    256,
  );
  const hkdfKey = await crypto.subtle.importKey('raw', bits, 'HKDF', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: utf8ToBytes(info),
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Derive the symmetric key for a conversation between two identities via
 * static-static ECDH. Both peers compute the identical key, and the HKDF `info`
 * binds it to the pair of JIDs (order-independent) so it can't be repurposed.
 * A valid GCM tag therefore proves the message came from the peer, not just any
 * eavesdropper.
 */
export async function deriveConversationKey(
  myPrivateKey: CryptoKey,
  peerPublicKeyRaw: Uint8Array,
  selfBareJid: string,
  peerBareJid: string,
): Promise<CryptoKey> {
  const peerPublicKey = await importPublicKeyRaw(peerPublicKeyRaw);
  const info = `viska-convo|${[selfBareJid, peerBareJid].sort().join('|')}`;
  return deriveAesKey(myPrivateKey, peerPublicKey, info);
}

// --- message encryption ----------------------------------------------------

export async function encrypt(
  key: CryptoKey,
  plaintext: string,
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    utf8ToBytes(plaintext) as BufferSource,
  );
  return { iv: bytesToBase64url(iv), ct: bytesToBase64url(new Uint8Array(ct)) };
}

export async function decrypt(
  key: CryptoKey,
  payload: EncryptedPayload,
): Promise<string> {
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64urlToBytes(payload.iv) as BufferSource },
    key,
    base64urlToBytes(payload.ct) as BufferSource,
  );
  return bytesToUtf8(new Uint8Array(plaintext));
}

// --- sealed box (auth challenge) -------------------------------------------

/**
 * Encrypt `data` so that only the holder of the private key matching
 * `recipientPublicKeyRaw` can read it. Uses a fresh ephemeral ECDH key pair
 * (classic ECIES). The server uses this to challenge a logging-in client.
 */
export async function seal(
  recipientPublicKeyRaw: Uint8Array,
  data: Uint8Array,
): Promise<SealedBox> {
  const ephemeral = await generateIdentity();
  const recipientPublicKey = await importPublicKeyRaw(recipientPublicKeyRaw);
  const key = await deriveAesKey(
    ephemeral.privateKey,
    recipientPublicKey,
    AUTH_KDF_INFO,
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data as BufferSource,
  );
  return {
    epk: bytesToBase64url(await exportPublicKeyRaw(ephemeral.publicKey)),
    iv: bytesToBase64url(iv),
    ct: bytesToBase64url(new Uint8Array(ct)),
  };
}

/** Open a {@link seal}ed box with the matching private key. Throws if the box
 * was not sealed to this key (GCM authentication failure). */
export async function openSeal(
  myPrivateKey: CryptoKey,
  box: SealedBox,
): Promise<Uint8Array> {
  const ephemeralPublicKey = await importPublicKeyRaw(
    base64urlToBytes(box.epk),
  );
  const key = await deriveAesKey(
    myPrivateKey,
    ephemeralPublicKey,
    AUTH_KDF_INFO,
  );
  const data = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64urlToBytes(box.iv) as BufferSource },
    key,
    base64urlToBytes(box.ct) as BufferSource,
  );
  return new Uint8Array(data);
}

/** Cryptographically strong random bytes. */
export function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/** A random identifier suitable for stanza and message ids. */
export function randomId(): string {
  return crypto.randomUUID();
}

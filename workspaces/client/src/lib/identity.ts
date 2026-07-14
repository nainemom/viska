/**
 * The user's identity: an ECDH key pair. Its public key (base64url) IS the
 * address others use to reach you — there is no username, domain, or server
 * account. Two flavours:
 *
 *  - temporary: a freshly generated random key pair. Non-recoverable — once the
 *    key is gone, so is the account.
 *  - persisted: the key pair is derived deterministically from a passphrase
 *    (PBKDF2 → a P-256 scalar). Entering the same passphrase on any device
 *    reproduces the exact same key, so the identity is recoverable and
 *    shareable. A shared passphrase means a shared identity — that is the
 *    model, not a bug. There is no reset.
 *
 * The private key never leaves the device. A logged-in session caches its key
 * pair (as a JWK) in localStorage so a reload stays signed in; the passphrase
 * itself is never stored.
 */

import { p256 } from '@noble/curves/nist.js';
import {
  bytesToBase64url,
  crypto,
  fingerprint,
  PASSWORD_KDF,
  utf8ToBytes,
} from '../shared/index.ts';

export type AccountMode = 'temp' | 'persisted';

export interface Identity {
  mode: AccountMode;
  /** ECDH private key: derives conversation keys and answers auth challenges. */
  privateKey: CryptoKey;
  /** Raw public key bytes. */
  publicKeyRaw: Uint8Array;
  /** The address = raw public key, base64url. This is what travels and what
   * others paste to reach you. */
  address: string;
  /** SHA-256 of the public key. Local history is keyed on this so a wrong
   * passphrase can never open the real identity's stored history. */
  fingerprint: string;
}

const STORAGE_KEY = 'viska:session';

interface StoredSession {
  mode: AccountMode;
  jwk: JsonWebKey;
}

// --- deterministic key derivation ------------------------------------------

function bytesToBigInt(bytes: Uint8Array): bigint {
  let value = 0n;
  for (const byte of bytes) value = (value << 8n) | BigInt(byte);
  return value;
}

function scalarToBytes(scalar: bigint): Uint8Array {
  const out = new Uint8Array(32);
  let value = scalar;
  for (let i = 31; i >= 0; i -= 1) {
    out[i] = Number(value & 0xffn);
    value >>= 8n;
  }
  return out;
}

/** Turn 32 seed bytes into a valid P-256 private-key JWK (with its public
 * point computed), importable by the Web Crypto API. */
function jwkFromSeed(seed: Uint8Array): JsonWebKey {
  const order = p256.Point.Fn.ORDER;
  const scalar = (bytesToBigInt(seed) % (order - 1n)) + 1n; // in [1, n-1]
  const priv = scalarToBytes(scalar);
  const pub = p256.getPublicKey(priv, false); // 0x04 || X(32) || Y(32)
  return {
    kty: 'EC',
    crv: 'P-256',
    d: bytesToBase64url(priv),
    x: bytesToBase64url(pub.slice(1, 33)),
    y: bytesToBase64url(pub.slice(33, 65)),
    ext: true,
    key_ops: ['deriveBits'],
  };
}

async function identityFromJwk(
  jwk: JsonWebKey,
  mode: AccountMode,
): Promise<Identity> {
  const privateKey = await crypto.importPrivateKeyJwk(jwk);
  const publicKeyRaw = await crypto.publicKeyRawFromJwk(jwk);
  const address = bytesToBase64url(publicKeyRaw);
  return {
    mode,
    privateKey,
    publicKeyRaw,
    address,
    fingerprint: await fingerprint(publicKeyRaw),
  };
}

// --- factories -------------------------------------------------------------

/** A brand-new anonymous identity (the "random user" button). */
export async function createTempIdentity(): Promise<Identity> {
  const keyPair = await crypto.generateIdentity();
  const jwk = await crypto.exportPrivateKeyJwk(keyPair.privateKey);
  return identityFromJwk(jwk, 'temp');
}

/** The identity derived from a passphrase (recoverable by re-entering it). */
export async function deriveIdentity(passphrase: string): Promise<Identity> {
  const baseKey = await globalThis.crypto.subtle.importKey(
    'raw',
    utf8ToBytes(passphrase),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: utf8ToBytes(PASSWORD_KDF.salt),
      iterations: PASSWORD_KDF.iterations,
      hash: 'SHA-256',
    },
    baseKey,
    256,
  );
  return identityFromJwk(jwkFromSeed(new Uint8Array(bits)), 'persisted');
}

// --- session persistence ---------------------------------------------------

/** Cache the signed-in identity so a reload stays logged in. */
export async function saveSession(identity: Identity): Promise<void> {
  const jwk = await crypto.exportPrivateKeyJwk(identity.privateKey);
  const session: StoredSession = { mode: identity.mode, jwk };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

/** Restore a previously cached session, or null if none / corrupt. */
export async function loadSession(): Promise<Identity | null> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const { mode, jwk } = JSON.parse(stored) as StoredSession;
    return await identityFromJwk(jwk, mode);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/** Forget the cached session (logout). Does not touch message history. */
export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

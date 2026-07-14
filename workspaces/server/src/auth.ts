/**
 * Proof-of-key-ownership challenge. This is what authenticates every session,
 * regardless of account type:
 *
 *   1. client -> hello       presents its raw public key
 *   2. server -> challenge   a random nonce sealed (ECIES) to that public key
 *   3. client -> auth        the decrypted nonce
 *   4. server verifies the nonce matches
 *
 * Only the holder of the matching private key can open the sealed box, so step
 * 4 succeeding proves ownership. For persisted accounts the presented public
 * key is first checked against the stored one, so a wrong password (which
 * derives a different key) is rejected before the challenge even begins.
 */

import { crypto, type SealedBox } from './shared/index.ts';

export interface Challenge {
  /** The random value the client must recover and echo back. */
  nonce: Uint8Array;
  /** The sealed box to send to the client. */
  box: SealedBox;
}

/** Build a challenge sealed to the client's presented public key. */
export async function createChallenge(
  publicKeyRaw: Uint8Array,
): Promise<Challenge> {
  const nonce = crypto.randomBytes(32);
  const box = await crypto.seal(publicKeyRaw, nonce);
  return { nonce, box };
}

/** Constant-time check that the client's response equals the expected nonce. */
export function verifyResponse(
  expectedNonce: Uint8Array,
  responseBytes: Uint8Array,
): boolean {
  if (responseBytes.length !== expectedNonce.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedNonce.length; i += 1) {
    diff |= responseBytes[i] ^ expectedNonce[i];
  }
  return diff === 0;
}

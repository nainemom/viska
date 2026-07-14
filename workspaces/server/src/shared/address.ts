/**
 * Addresses.
 *
 * A Viska identity is a raw ECDH public key. Its base64url form IS the address
 * you share — there is no username, no domain, and no server-side directory.
 * Because the address contains the key, encrypting to a contact needs no
 * lookup, and the server can never substitute a key it can't tamper with.
 */

import { bytesToBase64url } from './encoding.ts';

/** SHA-256 fingerprint (base64url) of a raw public key. Used only as a short,
 * stable local id (e.g. to namespace per-identity history), never on the wire. */
export async function fingerprint(rawPublicKey: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    rawPublicKey as BufferSource,
  );
  return bytesToBase64url(new Uint8Array(digest));
}

/** A short, human-friendly abbreviation of an address for lists and headings. */
export function shortAddress(address: string): string {
  return address.length > 16
    ? `${address.slice(0, 8)}…${address.slice(-4)}`
    : address;
}

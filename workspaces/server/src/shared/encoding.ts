/**
 * Byte <-> string helpers that behave identically in the browser and in Node.
 *
 * We use base64url everywhere on the wire so values are safe to drop into XML
 * attributes and text without escaping.
 */

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function utf8ToBytes(text: string): Uint8Array<ArrayBuffer> {
  return textEncoder.encode(text) as Uint8Array<ArrayBuffer>;
}

export function bytesToUtf8(bytes: Uint8Array): string {
  return textDecoder.decode(bytes);
}

/** Encode bytes as base64url (no padding), the form used across the protocol. */
export function bytesToBase64url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Decode a base64url (or plain base64) string back into bytes. */
export function base64urlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

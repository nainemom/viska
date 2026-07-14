/**
 * Protocol-wide constants shared by the client and the server.
 *
 * Everything here is deliberately plain data so both a browser bundle and a
 * Node process can import it without pulling in anything environment-specific.
 */

/** HKDF `info` label used when deriving the one-off AES key for the auth challenge. */
export const AUTH_KDF_INFO = 'viska-auth-challenge';

/**
 * PBKDF2 parameters for turning a passphrase into an identity key. There is no
 * username to salt with (the address is the derived public key itself), so the
 * salt is a fixed app label: the same passphrase always reproduces the same
 * identity, on any device. A shared passphrase therefore means a shared
 * identity — that is the model, not a bug.
 */
export const PASSWORD_KDF = {
  iterations: 210_000,
  salt: 'viska-identity-v3',
} as const;

/**
 * VAPID public key for Web Push. Safe to ship to the browser. The matching
 * private key lives only on the server (env `VAPID_PRIVATE_KEY`). Regenerate a
 * pair for a real deployment with `npx web-push generate-vapid-keys`.
 */
export const VAPID_PUBLIC_KEY =
  'BM5ooYD3Pk6K5m5qA34tuMTjv55js_BlhVdjRJCe18Yaob9wrmChiqC8EF_ZX9gJe17j16ucfw7eH4hXK3kjH0A';

/** Default WebSocket endpoint the server listens on / the client dials. */
export const DEFAULT_WS_PORT = 5280;
export const DEFAULT_WS_PATH = '/ws';

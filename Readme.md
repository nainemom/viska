<div align="center">
  <img src="https://raw.githubusercontent.com/nainemom/viska/dev/static/logo.png" height="200"/>
  <h1><b> Viska </b></h1>
  <p>An <b>Anonymous</b>, end-to-end encrypted chat service.</p>
  <br>
</div>

## Details

**Viska** (meaning `whisper` in Swedish and `everything` in Lithuanian) is an anonymous chat service. Messages are end-to-end encrypted in the browser and the server keeps no accounts and no conversation history — it is a plain relay.

## Your identity is a key, not a username

There are no usernames and no accounts on the server. Your identity is an ECDH key pair, and **your address is your public key** — that is the string you share with people so they can message you.

You get an identity in one of two ways:

- **Persist (a passphrase).** Enter a passphrase and the app derives the *same* key pair from it every time, entirely in your browser (PBKDF2 → P-256). Re-enter the same passphrase on any device to get the same identity back. There is no sign-up and no password reset — the passphrase *is* the account. Pick a strong one: a shared passphrase means a shared identity.
- **Temporary (a random identity).** Tap the button to get a random, throwaway key pair with no passphrase. It cannot be recovered.

The passphrase and the private key never leave your device. When you connect, the server proves you own the address by sending a challenge encrypted to your public key — only your private key can answer it, so nobody can connect as an address they don't hold.

## How is it end-to-end encrypted?

Every message is encrypted in your browser directly to the recipient's key (ECDH P-256 → HKDF → AES-256-GCM). Because an address *is* a public key, no key lookup is needed and the server can never substitute keys. The server only relays ciphertext and never sees your messages or your keys.

## Conversation history

History lives only in your browser (IndexedDB), never on the server.

- A **persist** account keeps its history when you log out — log back in with the same passphrase and it is still there. A **Wipe** button erases it on demand.
- A **temporary** account's history is erased the moment you log out.

## One device at a time

An identity can be connected on only one device. If you sign in somewhere else, the new device asks to take over and the other device is disconnected.

## Notifications

If someone messages you while you are offline, the server sends a Web Push notification to your device. To stay end-to-end encrypted the notification carries no content — just "you have a new message."

## Is my activity trackable?

In one word, no — but you still have to be careful to stay anonymous:

- don't share personal information in your chats;
- don't reuse a **persist** identity you've shared publicly for something you want kept separate.

## Development

The stack: a React + Vite client, a Node WebSocket server (`ws`) backed by PostgreSQL (Drizzle), and a small shared TypeScript package. Client and server talk a tiny JSON-over-WebSocket protocol.

```sh
npm install
podman compose up     # or: docker compose up
```

- Client → http://localhost:5173
- Server → ws://localhost:5280/ws

Web Push uses a dev VAPID key pair out of the box; generate your own for production with `npx web-push generate-vapid-keys` (see `compose.yml`). If you are upgrading an older checkout, reset the database volume once with `podman compose down -v`.

## How can I contribute?

Thanks for your interest in contributing to Viska! You can get started by reading our [contributing guideline](./CONTRIBUTING.md).

## Donation

If you like this project and want to help, you can send BTC to:

```
1DckVaVPkJQDBfga2Wd8moX9MbqUiurNoL
```

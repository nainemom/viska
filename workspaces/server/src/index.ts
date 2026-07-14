/**
 * Server entry point: a WebSocket server that speaks the Viska JSON protocol
 * (see shared/protocol.ts), backed by PostgreSQL.
 *
 * Run with `npm run dev -w @viska/back` (watch) or `npm start -w @viska/back`.
 * Env: PORT (default DEFAULT_WS_PORT), WS_PATH, DATABASE_URL,
 * VAPID_PRIVATE_KEY / VAPID_SUBJECT (Web Push).
 */

import { WebSocketServer } from 'ws';
import { initDb } from './db.ts';
import { createHub } from './hub.ts';
import { createSession } from './session.ts';
import { DEFAULT_WS_PATH, DEFAULT_WS_PORT } from './shared/index.ts';

const port = Number(process.env.PORT ?? DEFAULT_WS_PORT);
const path = process.env.WS_PATH ?? DEFAULT_WS_PATH;

await initDb();
console.log('[viska] database ready');

const hub = createHub();
const wss = new WebSocketServer({ port, path });

// Each connection is fully driven by its own session's state machine.
wss.on('connection', (ws) => createSession(ws, hub));

wss.on('listening', () => {
  console.log(`[viska] listening on ws://localhost:${port}${path}`);
});

wss.on('error', (err) => {
  console.error('[viska] server error:', err);
});

/**
 * The database layer — PostgreSQL via Drizzle ORM.
 *
 * The module exposes plain async functions. To point at a different database,
 * set DATABASE_URL; nothing else changes. The schema lives in ./schema.ts and
 * migrations are applied on startup by initDb().
 */

import { fileURLToPath } from 'node:url';
import { asc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { offlineMessages, pushSubscriptions } from './schema.ts';
import type { PushSubscriptionJson } from './shared/index.ts';

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://viska:viska@localhost:5432/viska';

const pool = new pg.Pool({ connectionString });
export const db = drizzle(pool, {
  schema: { offlineMessages, pushSubscriptions },
});

const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));

/** Wait for PostgreSQL to accept connections, then apply pending migrations. */
export async function initDb(): Promise<void> {
  const maxAttempts = 30;
  for (let attempt = 1; ; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      break;
    } catch (err) {
      if (attempt >= maxAttempts) throw err;
      console.log(
        `[viska] waiting for postgres (attempt ${attempt}/${maxAttempts})…`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  await migrate(db, { migrationsFolder });
}

// --- offline message queue -------------------------------------------------

/** Queue an already-encrypted envelope for a currently-offline recipient. */
export async function enqueueOffline(
  recipient: string,
  payload: string,
): Promise<void> {
  await db.insert(offlineMessages).values({ recipient, payload });
}

/** Atomically return and clear a recipient's queued payloads, oldest first. */
export async function drainOffline(recipient: string): Promise<string[]> {
  return db.transaction(async (tx) => {
    const rows = await tx
      .select({ payload: offlineMessages.payload })
      .from(offlineMessages)
      .where(eq(offlineMessages.recipient, recipient))
      .orderBy(asc(offlineMessages.id));
    if (rows.length > 0) {
      await tx
        .delete(offlineMessages)
        .where(eq(offlineMessages.recipient, recipient));
    }
    return rows.map((row) => row.payload);
  });
}

// --- push subscriptions ----------------------------------------------------

/** Remember (or replace) the Web Push subscription for an address. */
export async function savePushSubscription(
  address: string,
  subscription: PushSubscriptionJson,
): Promise<void> {
  await db
    .insert(pushSubscriptions)
    .values({ address, subscription: JSON.stringify(subscription) })
    .onConflictDoUpdate({
      target: pushSubscriptions.address,
      set: { subscription: JSON.stringify(subscription) },
    });
}

/** The Web Push subscription for an address, if one is registered. */
export async function getPushSubscription(
  address: string,
): Promise<PushSubscriptionJson | undefined> {
  const rows = await db
    .select({ subscription: pushSubscriptions.subscription })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.address, address))
    .limit(1);
  const raw = rows[0]?.subscription;
  return raw ? (JSON.parse(raw) as PushSubscriptionJson) : undefined;
}

/** Forget an address's push subscription (e.g. after it goes stale). */
export async function deletePushSubscription(address: string): Promise<void> {
  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.address, address));
}

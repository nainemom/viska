/**
 * Database schema (Drizzle ORM).
 *
 * `drizzle-kit generate` diffs this file against the SQL migrations in
 * ../drizzle and writes a new migration when it changes.
 *
 * The server stores no identities and no keys — an address IS a public key, so
 * there is nothing to look up. It persists only two things: messages queued for
 * offline recipients, and Web Push subscriptions. Everything is keyed by the
 * recipient's address.
 */

import {
  bigserial,
  index,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

/** Messages that arrived while a recipient had no connected device. */
export const offlineMessages = pgTable(
  'offline_messages',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    recipient: text('recipient').notNull(),
    /** JSON-encoded `{ from, id, enc }` — an already-encrypted envelope. */
    payload: text('payload').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('offline_messages_recipient_idx').on(table.recipient, table.id),
  ],
);

/** One Web Push subscription per address (single device per identity). */
export const pushSubscriptions = pgTable('push_subscriptions', {
  address: text('address').primaryKey(),
  /** JSON-encoded browser PushSubscription. */
  subscription: text('subscription').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

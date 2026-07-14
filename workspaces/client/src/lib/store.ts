/**
 * Browser-side persistence for decrypted message history, backed by IndexedDB
 * via the `idb` wrapper.
 *
 * History lives only in the browser and is namespaced per identity fingerprint,
 * so multiple identities on one browser stay separate — a persisted identity
 * (same passphrase → same key → same fingerprint) finds its history again,
 * while a temporary identity's database is thrown away when it logs out.
 *
 * There is no separate contact list: a "conversation" is simply a peer that
 * appears in the message history (see useViska).
 *
 *  - close(): release the handle on logout WITHOUT deleting anything.
 *  - wipe():  delete the whole database (the "wipe device" button, and the
 *             mandatory cleanup when a temporary identity logs out).
 */

import { type DBSchema, deleteDB, openDB } from 'idb';
import type { ChatMessage } from '../shared/index.ts';

interface ViskaSchema extends DBSchema {
  messages: { key: string; value: ChatMessage; indexes: { 'by-peer': string } };
}

const DB_VERSION = 1;

const dbName = (owner: string): string => `viska:${owner}`;

export interface Store {
  getMessages(peer: string): ChatMessage[];
  getAllMessages(): Record<string, ChatMessage[]>;
  addMessage(message: ChatMessage): Promise<void>;
  close(): void;
  wipe(): Promise<void>;
}

export async function createStore(owner: string): Promise<Store> {
  const name = dbName(owner);
  const db = await openDB<ViskaSchema>(name, DB_VERSION, {
    upgrade(database, oldVersion) {
      // Forward-only migrations keyed on the previous version.
      if (oldVersion < 1) {
        const messages = database.createObjectStore('messages', {
          keyPath: 'id',
        });
        messages.createIndex('by-peer', 'peer');
      }
    },
  });

  // Hydrate a cache so reads can stay synchronous.
  const messages = new Map<string, ChatMessage[]>();
  for (const message of await db.getAll('messages')) {
    const thread = messages.get(message.peer) ?? [];
    thread.push(message);
    messages.set(message.peer, thread);
  }
  for (const thread of messages.values()) thread.sort((a, b) => a.at - b.at);

  return {
    getMessages: (peer) => messages.get(peer) ?? [],
    getAllMessages: () => Object.fromEntries(messages),

    async addMessage(message) {
      const thread = messages.get(message.peer) ?? [];
      thread.push(message);
      messages.set(message.peer, thread);
      await db.put('messages', message);
    },

    close() {
      db.close();
    },

    async wipe() {
      messages.clear();
      db.close();
      await deleteDB(name);
    },
  };
}

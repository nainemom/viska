/**
 * The single React hook that ties identity, connection, and local storage
 * together and exposes plain state + actions to the UI.
 *
 * Lifecycle: signed-out → (passphrase | random) → connecting → online. A second
 * device for the same identity triggers a `conflict` the user resolves by
 * taking over (kicking the other device) or cancelling.
 *
 * There is no contact list — a "conversation" is any peer that appears in the
 * message history, plus whatever new chat you have just opened.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  base64urlToBytes,
  type ChatMessage,
  crypto,
  DEFAULT_WS_PATH,
  DEFAULT_WS_PORT,
  type ErrorCode,
} from '../shared/index.ts';
import { createConnection, type ViskaConnection } from './connection.ts';
import {
  clearSession,
  createTempIdentity,
  deriveIdentity,
  type Identity,
  loadSession,
  saveSession,
} from './identity.ts';
import { subscribeToPush, unsubscribeFromPush } from './push.ts';
import { createStore, type Store } from './store.ts';

const WS_URL =
  import.meta.env.VITE_WS_URL ??
  `ws://${location.hostname}:${DEFAULT_WS_PORT}${DEFAULT_WS_PATH}`;

export type Phase =
  | 'signed-out'
  | 'connecting'
  | 'conflict'
  | 'online'
  | 'offline';

export interface Viska {
  phase: Phase;
  identity: Identity | null;
  /** Peer addresses with history, most recently active first. */
  conversations: string[];
  messagesByPeer: Record<string, ChatMessage[]>;
  presence: Record<string, boolean>;
  error: string | null;
  busy: boolean;
  loginWithPassphrase: (passphrase: string) => Promise<void>;
  loginTemp: () => Promise<void>;
  logout: () => Promise<void>;
  wipe: () => Promise<void>;
  confirmTakeover: () => void;
  cancelTakeover: () => void;
  /** Validate a pasted address and open a chat with it; returns it, or null. */
  startChat: (address: string) => Promise<string | null>;
  sendMessage: (peer: string, body: string) => Promise<void>;
}

export function useViska(): Viska {
  const [phase, setPhase] = useState<Phase>('signed-out');
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [messagesByPeer, setMessagesByPeer] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [presence, setPresence] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const connectionRef = useRef<ViskaConnection | null>(null);
  const storeRef = useRef<Store | null>(null);
  const identityRef = useRef<Identity | null>(null);

  // Conversations = peers with history, most recent message first.
  const conversations = useMemo(
    () =>
      Object.keys(messagesByPeer).sort(
        (a, b) =>
          (messagesByPeer[b]?.at(-1)?.at ?? 0) -
          (messagesByPeer[a]?.at(-1)?.at ?? 0),
      ),
    [messagesByPeer],
  );

  const resetState = useCallback(() => {
    connectionRef.current = null;
    storeRef.current = null;
    identityRef.current = null;
    setIdentity(null);
    setMessagesByPeer({});
    setPresence({});
  }, []);

  const endSession = useCallback(
    async (history: 'keep' | 'wipe') => {
      connectionRef.current?.disconnect();
      void unsubscribeFromPush();
      const store = storeRef.current;
      if (store) {
        if (history === 'wipe') await store.wipe();
        else store.close();
      }
      clearSession();
      resetState();
      setPhase('signed-out');
    },
    [resetState],
  );

  const startSession = useCallback(
    async (id: Identity) => {
      const store = await createStore(id.fingerprint);
      const connection = createConnection(WS_URL, id);

      connection.handlers = {
        onStatus: (status) => {
          if (status === 'online') {
            setPhase('online');
            void saveSession(id);
            for (const peer of Object.keys(store.getAllMessages()))
              connection.probePresence(peer);
            void subscribeToPush().then((sub) => {
              if (sub) connection.subscribePush(sub);
            });
          } else {
            setPhase(status === 'connecting' ? 'connecting' : 'offline');
          }
        },
        onConflict: () => setPhase('conflict'),
        onKicked: () => {
          void endSession('keep');
          setError('Signed out — this identity was opened on another device.');
        },
        onError: (_code: ErrorCode, message) => {
          void endSession(id.mode === 'temp' ? 'wipe' : 'keep');
          setError(message);
        },
        onPresence: (address, online) =>
          setPresence((prev) => ({ ...prev, [address]: online })),
        onMessage: (incoming) => {
          const current = storeRef.current;
          if (!current) return;
          const message: ChatMessage = {
            id: incoming.id || crypto.randomId(),
            peer: incoming.from,
            direction: 'in',
            body: incoming.body,
            at: Date.now(),
          };
          void current.addMessage(message);
          setMessagesByPeer((prev) => ({
            ...prev,
            [incoming.from]: [...(prev[incoming.from] ?? []), message],
          }));
        },
      };

      connectionRef.current = connection;
      storeRef.current = store;
      identityRef.current = id;
      setError(null);
      setIdentity(id);
      setMessagesByPeer({ ...store.getAllMessages() });
      setPhase('connecting');
      connection.connect();
    },
    [endSession],
  );

  // Restore a cached session on load (stay signed in across reloads).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const restored = await loadSession();
      if (cancelled || !restored) return;
      await startSession(restored);
    })();
    return () => {
      cancelled = true;
      connectionRef.current?.disconnect();
    };
  }, [startSession]);

  // Poll conversations' presence periodically while online.
  useEffect(() => {
    if (phase !== 'online') return;
    const timer = setInterval(() => {
      const connection = connectionRef.current;
      if (!connection) return;
      for (const peer of conversations) connection.probePresence(peer);
    }, 15000);
    return () => clearInterval(timer);
  }, [phase, conversations]);

  const loginWithPassphrase = useCallback(
    async (passphrase: string) => {
      setBusy(true);
      setError(null);
      try {
        await startSession(await deriveIdentity(passphrase));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not sign in.');
      } finally {
        setBusy(false);
      }
    },
    [startSession],
  );

  const loginTemp = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await startSession(await createTempIdentity());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start session.');
    } finally {
      setBusy(false);
    }
  }, [startSession]);

  const logout = useCallback(async () => {
    await endSession(identityRef.current?.mode === 'temp' ? 'wipe' : 'keep');
  }, [endSession]);

  const wipe = useCallback(async () => {
    await endSession('wipe');
  }, [endSession]);

  const confirmTakeover = useCallback(() => {
    connectionRef.current?.confirmTakeover();
    setPhase('connecting');
  }, []);

  const cancelTakeover = useCallback(() => {
    void endSession('keep');
  }, [endSession]);

  const startChat = useCallback(
    async (rawAddress: string): Promise<string | null> => {
      setError(null);
      const connection = connectionRef.current;
      if (!connection) return null;
      const address = rawAddress.trim();
      if (address === identityRef.current?.address) {
        setError('That is your own address.');
        return null;
      }
      try {
        await crypto.importPublicKeyRaw(base64urlToBytes(address)); // validate
      } catch {
        setError('That does not look like a valid Viska address.');
        return null;
      }
      connection.probePresence(address);
      return address;
    },
    [],
  );

  const sendMessage = useCallback(async (peer: string, body: string) => {
    setError(null);
    const connection = connectionRef.current;
    const store = storeRef.current;
    if (!connection || !store) return;
    try {
      const id = await connection.sendMessage(peer, body);
      const message: ChatMessage = {
        id,
        peer,
        direction: 'out',
        body,
        at: Date.now(),
      };
      await store.addMessage(message);
      setMessagesByPeer((prev) => ({
        ...prev,
        [peer]: [...(prev[peer] ?? []), message],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message.');
    }
  }, []);

  return {
    phase,
    identity,
    conversations,
    messagesByPeer,
    presence,
    error,
    busy,
    loginWithPassphrase,
    loginTemp,
    logout,
    wipe,
    confirmTakeover,
    cancelTakeover,
    startChat,
    sendMessage,
  };
}

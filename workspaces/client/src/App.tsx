import { useState } from 'react';
import { useViska, type Viska } from './lib/useViska.ts';
import { shortAddress } from './shared/index.ts';

/** One-line preview of a message body for the conversation list. */
function preview(body: string): string {
  return body.length > 32 ? `${body.slice(0, 32)}…` : body;
}

function AuthScreen({ viska }: { viska: Viska }) {
  const [passphrase, setPassphrase] = useState('');

  return (
    <main>
      <h1>Viska</h1>
      <p>End-to-end encrypted, anonymous chat.</p>

      <section>
        <h2>Unlock with a passphrase</h2>
        <p>
          Your passphrase <em>is</em> your identity — the same passphrase always
          unlocks the same account, on any device. There is no signup and no
          reset, so pick something strong and don't forget it.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (passphrase) void viska.loginWithPassphrase(passphrase);
          }}
        >
          <input
            type="password"
            value={passphrase}
            size={40}
            placeholder="passphrase"
            autoComplete="current-password"
            onChange={(event) => setPassphrase(event.target.value)}
          />{' '}
          <button type="submit" disabled={viska.busy || !passphrase}>
            Unlock
          </button>
        </form>
      </section>

      <hr />

      <section>
        <h2>Or a throwaway identity</h2>
        <p>
          A random identity has no passphrase and cannot be recovered. Its
          history is erased the moment you log out.
        </p>
        <button
          type="button"
          disabled={viska.busy}
          onClick={() => void viska.loginTemp()}
        >
          Continue as a random user
        </button>
      </section>

      {viska.error ? (
        <p>
          <strong>Problem:</strong> {viska.error}
        </p>
      ) : null}
    </main>
  );
}

function ConflictScreen({ viska }: { viska: Viska }) {
  return (
    <main>
      <h1>Viska</h1>
      <section>
        <h2>Already signed in elsewhere</h2>
        <p>
          This identity is currently connected on another device. Only one
          device can be signed in at a time.
        </p>
        <p>
          <button type="button" onClick={() => viska.confirmTakeover()}>
            Use it here (disconnect the other device)
          </button>{' '}
          <button type="button" onClick={() => viska.cancelTakeover()}>
            Cancel
          </button>
        </p>
      </section>
    </main>
  );
}

function ChatScreen({ viska }: { viska: Viska }) {
  const identity = viska.identity;
  const [selected, setSelected] = useState<string | null>(null);
  const [newChat, setNewChat] = useState('');
  const [draft, setDraft] = useState('');
  if (!identity) return null;

  const messages = selected ? (viska.messagesByPeer[selected] ?? []) : [];
  const temporary = identity.mode === 'temp';

  return (
    <main>
      <h1>Viska</h1>
      <p>
        Signed in with{' '}
        <strong>{temporary ? 'a random identity' : 'your passphrase'}</strong> —
        connection: <strong>{viska.phase}</strong>
      </p>

      <section>
        <h2>Your address</h2>
        <p>
          Share this with anyone you want to chat with. It is your public key.
        </p>
        <input
          readOnly
          size={72}
          value={identity.address}
          onFocus={(event) => event.currentTarget.select()}
        />{' '}
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(identity.address)}
        >
          Copy
        </button>
      </section>

      <p>
        <button type="button" onClick={() => void viska.logout()}>
          {temporary ? 'Log out (erases everything)' : 'Log out (keep history)'}
        </button>{' '}
        {temporary ? null : (
          <button
            type="button"
            onClick={() => {
              if (confirm('Erase all history on this device?'))
                void viska.wipe();
            }}
          >
            Wipe this device
          </button>
        )}
      </p>

      <hr />

      {viska.error ? (
        <p>
          <strong>Problem:</strong> {viska.error}
        </p>
      ) : null}

      <section>
        <h2>Conversations</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const address = newChat.trim();
            if (!address) return;
            void viska.startChat(address).then((opened) => {
              if (opened) {
                setSelected(opened);
                setNewChat('');
              }
            });
          }}
        >
          <input
            size={72}
            value={newChat}
            placeholder="paste an address to start a new chat"
            onChange={(event) => setNewChat(event.target.value)}
          />{' '}
          <button type="submit">New chat</button>
        </form>

        {viska.conversations.length === 0 ? (
          <p>No conversations yet. Start one above.</p>
        ) : (
          <ul>
            {viska.conversations.map((peer) => {
              const last = viska.messagesByPeer[peer]?.at(-1);
              return (
                <li key={peer}>
                  <button
                    type="button"
                    onClick={() => setSelected(peer)}
                    title={peer}
                  >
                    {viska.presence[peer] ? '🟢' : '⚪'} {shortAddress(peer)}
                    {last
                      ? ` — ${last.direction === 'out' ? 'You: ' : ''}${preview(last.body)}`
                      : ''}
                    {selected === peer ? ' — open' : ''}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <hr />

      <section>
        <h2>{selected ? `Chat with ${shortAddress(selected)}` : 'Chat'}</h2>
        {!selected ? (
          <p>Pick a conversation, or start a new chat above.</p>
        ) : (
          <>
            <p>
              Talking to: <code title={selected}>{shortAddress(selected)}</code>{' '}
              {viska.presence[selected]
                ? '(online)'
                : '(offline — messages will be delivered later)'}
            </p>

            {messages.length === 0 ? (
              <p>No messages yet. Say hello.</p>
            ) : (
              <ul>
                {messages.map((message) => (
                  <li key={message.id}>
                    <strong>
                      {message.direction === 'out' ? 'You' : 'Them'}:
                    </strong>{' '}
                    {message.body}{' '}
                    <small>{new Date(message.at).toLocaleTimeString()}</small>
                  </li>
                ))}
              </ul>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                const text = draft.trim();
                if (text) {
                  void viska.sendMessage(selected, text);
                  setDraft('');
                }
              }}
            >
              <input
                size={50}
                value={draft}
                autoComplete="off"
                placeholder="type a message"
                onChange={(event) => setDraft(event.target.value)}
              />{' '}
              <button type="submit" disabled={viska.phase !== 'online'}>
                Send
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

function App() {
  const viska = useViska();
  if (viska.phase === 'signed-out') return <AuthScreen viska={viska} />;
  if (viska.phase === 'conflict') return <ConflictScreen viska={viska} />;
  return <ChatScreen viska={viska} />;
}

export default App;

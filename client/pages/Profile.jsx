import { useCallback, useState } from 'preact/hooks';
import { useParams } from '../../utils/url.client.js';
import { useEventListener } from '../../utils/useEventListener.client.js';
import { useServer } from '../services/server.jsx';

export default function Profile() {
  const [{
    server = '',
    user,
  }] = useParams();
  const [,,sendWsMessage,identity] = useServer();
  const [messages, setMessages] = useState([]);

  useEventListener(window, 'ws:message', (e) => {
    setMessages((oldMessages) => [...oldMessages, e.detail]);
  });

  const handleSendMessageSubmit = useCallback((event) => {
    event.preventDefault();
    sendWsMessage('message', {
      to: event.target.to.value,
      body: event.target.body.value,
    })
  });


  return (
    <>
      <p>You are connected to server {server} as <b>{identity}</b>!</p>
      <form onSubmit={ handleSendMessageSubmit }>
        Send Message:
        <div>
          <input name="to" placeholder="To" />
        </div>
        <div>
          <textarea name="body" placeholder="Body"></textarea>
        </div>
        <div>
          <button type="submit">Send</button>
        </div>
      </form>
      <div>
        Messages:
        <ul>
          {messages.map((message) => (
            <li>
              from: {message.from},
              to: {message.to},
              body: {message.body}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

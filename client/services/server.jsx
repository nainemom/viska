import { createContext } from 'preact';
import { useCallback, useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { useParams } from '../../utils/url.client.js';
import { createWsMessage, parseWsMessage } from '../../utils/wsMessage.js';

const serverContext = createContext();

export const useServer = () => {
  const [{ server: serverAddress }] = useParams();
  const [
    [server, setServer],
    [isConnected, setIsConnected],
    [identity, setIdentity],
  ] = useContext(serverContext);

  const handleWsMessage = useCallback(({ data: rawData }) => {
    const { event, data } = parseWsMessage(rawData);
    if (event === 'identify') {
      setIdentity(data);
    }
    window.dispatchEvent(new CustomEvent(`ws:${event}`, {
      detail: data,
    }));
  }, []);

  const handleWsError = useCallback(() => {
    window.dispatchEvent(new CustomEvent('ws:error', {
      detail: undefined,
    }));
  }, []);

  const connect = useCallback((passprase = '', accessKey = '') => {
    if (!serverAddress) return;
    const ws = new WebSocket(`ws://${serverAddress}/?passprase=${encodeURIComponent(passprase)}&access_key=${encodeURIComponent(accessKey)}`);
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => handleWsError;
    ws.onmessage = handleWsMessage;
    setServer(ws);
  }, [server, serverAddress, handleWsMessage, handleWsError]);

  const send = useCallback((eventName, data) => {
    if (!server) return;
    server.send(createWsMessage(eventName, data));
  }, [server]);

  return [isConnected, connect, send, identity];
}


export function ServerProvider({ children }) {
  const serverState = useState(undefined);
  const isConnectedState = useState(false);
  const identityState = useState(false);

  const providerValue = useMemo(() => [serverState, isConnectedState, identityState], [serverState, isConnectedState, identityState]);

  return (
    <serverContext.Provider value={providerValue}>
      {children}
    </serverContext.Provider>
  );
}

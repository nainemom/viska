import { useStorage } from '../../utils/storage.client.js';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { useParams } from '../../utils/url.client.js';

export default function Servers() {
  const [_, setParams] = useParams();
  const [servers, setServers] = useStorage('viska:servers', [], localStorage);
  const [selectedServer, setSelectedServer] = useState(servers[0]);

  const handleRemoveButtonClick = useCallback((server) => () => {
    setServers((oldServers) => {
      const index = oldServers.findIndex((serverItem) => serverItem === server);
      if (index > -1) {
        return [
          ...oldServers.slice(0, index),
          ...oldServers.slice(index + 1),
        ];
      }
      return oldServers;
    });
  }, [servers]);

  const handleAddButtonClick = useCallback(() => {
    const newServer = prompt('Enter Server Address:');
    if (servers.findIndex((serverItem) => serverItem === newServer) > -1) {
      return alert(`The server "${newServer} is already on list.`);
    }
    setServers((oldServers) => [
      ...oldServers,
      newServer,
    ]);
  }, [servers]);

  const handleConnectButtonClick = useCallback(() => {
    setParams((oldParams) => ({
      ...oldParams,
      server: selectedServer,
    }));
  }, [selectedServer]);

  useEffect(() => {
    setSelectedServer(servers[servers.length - 1]);
  }, [servers]);

  return (
    <div className="h-full">
      <button onClick={handleAddButtonClick}>Add Server</button>
      <ol>
        { servers.map((server) => (
          <li onClick={ () => setSelectedServer(server) } tabIndex="0">
            {server} {selectedServer === server && '(selected)'}
            <button onClick={handleRemoveButtonClick(server)}>Remove</button>
          </li>
        ))}

      </ol>
      <button onClick={handleConnectButtonClick}>Connect</button>
    </div>
  )
}

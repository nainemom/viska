import Servers from './pages/Servers.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import { useServer } from './services/server.jsx';
import { useParams } from '../utils/url.client.js';

export function App() {
  const [{
    server = '',
  }] = useParams();


  const [serverStatus] = useServer();

  return (
    <>
      { !server && <Servers /> }
      { server && !serverStatus && <Login /> }
      { server && serverStatus && <Profile /> }
    </>
  )
}

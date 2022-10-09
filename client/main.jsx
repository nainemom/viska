import { render } from 'preact';
import { App } from './app';
import './index.css';
import { ServerProvider } from './services/server.jsx';

render(<ServerProvider><App /></ServerProvider>, document.getElementById('app'));

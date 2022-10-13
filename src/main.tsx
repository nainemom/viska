import { render } from 'preact';
import { App } from './App';
import './index.css';

render(
  <App />,
  document.querySelector('#app') as HTMLElement,
);

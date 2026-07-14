import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootEl = document.querySelector<HTMLDivElement>('#root');

if (!rootEl) {
  throw new Error('Root element not found');
}

// Register the service worker that surfaces offline push notifications.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // notifications simply stay unavailable if this fails
    });
  });
}

// Note: no <StrictMode>. Its dev-only double-mount would open the WebSocket
// twice, tripping the one-device-per-account guard on every reload.
createRoot(rootEl).render(<App />);

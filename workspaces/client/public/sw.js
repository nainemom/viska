/**
 * Viska service worker. Its only job is to show a notification when a push
 * arrives while the app is closed. The push carries no message content — the
 * server cannot read end-to-end encrypted messages — so the notification is
 * deliberately generic.
 */

self.addEventListener('push', (event) => {
  let payload = { title: 'Viska', body: 'You have a new message.' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // keep the default payload
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/logo-transparent.svg',
      badge: '/logo-transparent.svg',
      tag: 'viska-message',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('/');
    }),
  );
});

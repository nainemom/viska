/**
 * Web Push helpers. Registration of the service worker happens once in
 * main.tsx; here we turn a granted notification permission into a push
 * subscription the server can later use to wake this device.
 */

import {
  base64urlToBytes,
  type PushSubscriptionJson,
  VAPID_PUBLIC_KEY,
} from '../shared/index.ts';

const supported = (): boolean =>
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

/**
 * Ask permission (if not already decided) and return this device's push
 * subscription, or null if unsupported / denied. Safe to call repeatedly —
 * an existing subscription is reused.
 */
export async function subscribeToPush(): Promise<PushSubscriptionJson | null> {
  if (!supported()) return null;
  if (Notification.permission === 'denied') return null;
  if (Notification.permission === 'default') {
    if ((await Notification.requestPermission()) !== 'granted') return null;
  }
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64urlToBytes(VAPID_PUBLIC_KEY),
    }));
  return subscription.toJSON() as PushSubscriptionJson;
}

/** Drop this device's push subscription (on logout). */
export async function unsubscribeFromPush(): Promise<void> {
  if (!supported()) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    await existing?.unsubscribe();
  } catch {
    // ignore
  }
}

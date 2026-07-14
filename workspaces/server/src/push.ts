/**
 * Web Push notifications for offline recipients.
 *
 * When a message is queued for an account that has no connected device, we send
 * that account's registered browser a content-less push ("new message"). It is
 * content-less by necessity: the server is never able to read message plaintext
 * (end-to-end encryption), so it has nothing to put in the notification body.
 *
 * The VAPID public key is shared with the client (see constants.ts). The
 * private key is read from the environment; a dev fallback keeps `podman
 * compose up` working out of the box. Regenerate both for a real deployment
 * with `npx web-push generate-vapid-keys`.
 */

import webpush from 'web-push';
import { deletePushSubscription, getPushSubscription } from './db.ts';
import { VAPID_PUBLIC_KEY } from './shared/index.ts';

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ??
  'SbLx4sEUxK2oGeodKPP2sKqdDA3AE97m2uzpzqz-XDU';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:admin@viska.local';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

/** Notify an address's device that a message is waiting, if it has subscribed.
 * Silently prunes subscriptions the push service reports as gone. */
export async function notifyOffline(address: string): Promise<void> {
  const subscription = await getPushSubscription(address);
  if (!subscription) return;
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title: 'Viska', body: 'You have a new message.' }),
    );
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) {
      await deletePushSubscription(address);
    } else {
      console.error('[viska] push failed:', err);
    }
  }
}

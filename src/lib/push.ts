/**
 * Web Push notification utility.
 *
 * Required environment variables:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY  — public VAPID key (safe to expose to browser)
 *   VAPID_PRIVATE_KEY             — private VAPID key (server-side only)
 *   VAPID_EMAIL                   — contact email for VAPID (e.g. mailto:admin@example.com)
 *
 * Generate a keypair once with:
 *   npx web-push generate-vapid-keys
 *
 * Example output (DO NOT use these — generate your own):
 *   Public Key:  BG-hWUcnXMAQh0Yu3XgjtSCMSDyAfG3zXF_5Cvb8S_21A8welve2uRuT7VUaURdrJdGWMNlfnnlHI143QvhSTPY
 *   Private Key: z7JzUSok2h_m-kfr8brxFfOUEgASgjLDuqc4KMC7Dy8
 *
 * Add to .env.local:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your public key>
 *   VAPID_PRIVATE_KEY=<your private key>
 *   VAPID_EMAIL=mailto:admin@yourdomain.com
 */

import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getVapidDetails() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || 'mailto:admin@example.com';

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey, email };
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
}

/**
 * Send a push notification to all subscriptions for a user.
 * Silently skips if VAPID keys are not configured.
 * Automatically removes expired/invalid subscriptions (HTTP 410 or 404).
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  url: string
): Promise<{ sent: number; removed: number }> {
  const vapid = getVapidDetails();
  if (!vapid) {
    console.warn('VAPID keys not configured — skipping push notification');
    return { sent: 0, removed: 0 };
  }

  webpush.setVapidDetails(vapid.email, vapid.publicKey, vapid.privateKey);

  const supabase = getSupabase();

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId);

  if (error || !subscriptions || subscriptions.length === 0) {
    return { sent: 0, removed: 0 };
  }

  const payload: PushPayload = { title, body, url };
  const payloadStr = JSON.stringify(payload);

  let sent = 0;
  let removed = 0;
  const toRemove: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payloadStr
        );
        sent++;
      } catch (err: unknown) {
        const statusCode =
          err && typeof err === 'object' && 'statusCode' in err
            ? (err as { statusCode: number }).statusCode
            : null;

        // 410 Gone = subscription expired/unsubscribed — safe to delete
        // 404 Not Found = endpoint no longer valid
        if (statusCode === 410 || statusCode === 404) {
          toRemove.push(sub.id);
          removed++;
        } else {
          console.error(`Push send failed for endpoint ${sub.endpoint}:`, err);
        }
      }
    })
  );

  if (toRemove.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', toRemove);
  }

  return { sent, removed };
}

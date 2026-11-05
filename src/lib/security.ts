import crypto from 'crypto';
import type { NextRequest } from 'next/server';

/** Escape a value for interpolation into HTML (emails etc). */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * Authorise a cron / internal request. Accepts the Vercel Cron convention
 * (`Authorization: Bearer $CRON_SECRET`), the legacy `x-cron-secret` header and
 * the legacy `?secret=` query param. Fails closed when CRON_SECRET is unset.
 */
export function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  const candidates = [
    auth?.startsWith('Bearer ') ? auth.slice(7) : null,
    req.headers.get('x-cron-secret'),
    req.nextUrl.searchParams.get('secret'),
  ];
  return candidates.some((c) => typeof c === 'string' && safeEqual(c, secret));
}

/**
 * Only allow same-origin relative paths for post-login redirects.
 * Rejects absolute URLs, protocol-relative (`//evil`), backslash tricks and
 * userinfo tricks (`@evil.com` appended to the origin).
 */
export function safeRedirectPath(next: string | null | undefined, fallback = '/account'): string {
  if (!next || typeof next !== 'string') return fallback;
  if (!next.startsWith('/')) return fallback;
  if (next.startsWith('//') || next.startsWith('/\\') || next.includes('\\')) return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f]/.test(next)) return fallback;
  return next;
}

// ── Best-effort in-memory rate limiter ─────────────────────────────────────
// Serverless instances don't share memory, so this only slows down bursts from
// a single client hitting a warm instance. DB-backed checks are used where it
// matters (posts, messages, responses).
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    // crude memory bound
    const firstKey = buckets.keys().next().value;
    if (firstKey !== undefined) buckets.delete(firstKey);
  }
  return true;
}

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/** Only accept post image URLs that point at our own Supabase post-images bucket. */
export function isAllowedPostImageUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;
  const prefix = `${base.replace(/\/$/, '')}/storage/v1/object/public/post-images/`;
  return url.startsWith(prefix) && !url.includes('..');
}

export function sanitizeImageUrls(input: unknown, max = 10): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter(isAllowedPostImageUrl).slice(0, max);
}

/**
 * Validate a Twilio webhook signature (X-Twilio-Signature).
 * https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
export function verifyTwilioSignature(
  authToken: string,
  signature: string | null,
  urls: string[],
  params: Record<string, string>
): boolean {
  if (!signature) return false;
  const sorted = Object.keys(params)
    .sort()
    .map((k) => k + params[k])
    .join('');
  return urls.some((url) => {
    const expected = crypto
      .createHmac('sha1', authToken)
      .update(url + sorted, 'utf8')
      .digest('base64');
    return safeEqual(expected, signature);
  });
}

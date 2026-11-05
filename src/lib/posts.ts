import type { SupabaseClient } from '@supabase/supabase-js';
import { geocodeCrossStreet, fuzzCoordinates } from '@/lib/geocode';
import { sendEmail, postConfirmationEmail } from '@/lib/email';
import { sanitizeImageUrls } from '@/lib/security';

const TYPES = ['need', 'offer'];
const CATEGORIES = ['items', 'services', 'skills', 'space', 'other'];
const URGENCIES = ['flexible', 'this_week', 'today'];
const CONTACT_METHODS = ['app', 'phone', 'email'];

/** Max posts per web author per rolling 24h. */
export const MAX_POSTS_PER_DAY = 10;

export interface CreatePostInput {
  type: unknown;
  title: unknown;
  details?: unknown;
  category?: unknown;
  urgency?: unknown;
  contact_name: unknown;
  contact_method?: unknown;
  contact_value?: unknown;
  location_label?: unknown;
  location_crossstreet?: unknown;
  image_urls?: unknown;
}

interface Author {
  /** Authenticated web user id (from the session, never from the request body). */
  userId?: string | null;
  /** Verified SMS sender phone (from a Twilio-signed webhook). */
  smsPhone?: string | null;
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

/**
 * Create a post. Shared by POST /api/posts (web, authenticated) and the SMS
 * webhook so that authorship can't be spoofed via the request body.
 */
export async function createPost(
  supabase: SupabaseClient,
  input: CreatePostInput,
  author: Author
): Promise<{ post?: any; error?: string; status?: number }> {
  const type = typeof input.type === 'string' && TYPES.includes(input.type) ? input.type : null;
  const title = str(input.title, 200);
  const contact_name = str(input.contact_name, 80);
  if (!type || !title || !contact_name) {
    return { error: 'type, title and contact_name are required', status: 400 };
  }

  const category = typeof input.category === 'string' && CATEGORIES.includes(input.category) ? input.category : 'other';
  const urgency = typeof input.urgency === 'string' && URGENCIES.includes(input.urgency) ? input.urgency : 'flexible';
  const contact_method =
    typeof input.contact_method === 'string' && CONTACT_METHODS.includes(input.contact_method)
      ? input.contact_method
      : 'app';
  const contact_value = contact_method === 'app' ? null : str(input.contact_value, 200);
  const location_crossstreet = str(input.location_crossstreet, 120);
  const location_label = str(input.location_label, 120);

  // DB-backed rate limit per web author (SMS is rate-limited in the webhook).
  if (author.userId) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', author.userId)
      .gte('created_at', since);
    if ((count || 0) >= MAX_POSTS_PER_DAY) {
      return { error: 'You have posted a lot today. Please try again tomorrow.', status: 429 };
    }
  }

  // Geocode the cross-street (server-side only; client-supplied coordinates are ignored).
  let location_lat: number | null = null;
  let location_lng: number | null = null;
  if (location_crossstreet) {
    const coords = await geocodeCrossStreet(location_crossstreet);
    if (coords) {
      location_lat = coords.lat;
      location_lng = coords.lng;
    }
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      type,
      title,
      details: str(input.details, 5000),
      category,
      urgency,
      contact_name,
      contact_method,
      contact_value,
      source: author.smsPhone ? 'sms' : 'web',
      // The sender's phone is kept out of the publicly readable posts table
      // (see post_sms_contacts below / migration 020).
      source_phone: null,
      user_id: author.userId || null,
      location_label,
      location_crossstreet,
      location_lat,
      location_lng,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      image_urls: sanitizeImageUrls(input.image_urls),
    })
    .select()
    .single();

  if (error || !post) {
    console.error('Post insert error:', error);
    return { error: 'Could not create post', status: 500 };
  }

  if (author.smsPhone) {
    const { error: contactErr } = await supabase
      .from('post_sms_contacts')
      .insert({ post_id: post.id, phone: author.smsPhone });
    if (contactErr) {
      // Migration 020 not applied yet: fall back to the legacy column so SMS
      // reply notifications keep working.
      await supabase.from('posts').update({ source_phone: author.smsPhone }).eq('id', post.id);
    }
  }

  let location_fuzzed_lat: number | null = null;
  let location_fuzzed_lng: number | null = null;
  if (location_lat && location_lng) {
    const fuzzed = fuzzCoordinates(location_lat, location_lng, post.id);
    location_fuzzed_lat = fuzzed.lat;
    location_fuzzed_lng = fuzzed.lng;
    await supabase.from('posts').update({ location_fuzzed_lat, location_fuzzed_lng }).eq('id', post.id);
  }

  // Confirmation email only ever goes to the authenticated account's own email
  // (never to a free-text contact_value, which would make this an open relay).
  if (author.userId) {
    try {
      const { data: { user } } = await supabase.auth.admin.getUserById(author.userId);
      if (user?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
        const { subject, html, text } = postConfirmationEmail({
          posterName: contact_name,
          postTitle: title,
          postType: type as 'need' | 'offer',
          postUrl: `${appUrl}/post/${post.id}`,
        });
        sendEmail({ to: { email: user.email, name: contact_name }, subject, html, text }).catch(() => {});
      }
    } catch {}
  }

  // Never echo private fields back to the client.
  const { source_phone: _sp, location_lat: _la, location_lng: _ln, ...publicPost } = post;
  return { post: { ...publicPost, location_fuzzed_lat, location_fuzzed_lng } };
}

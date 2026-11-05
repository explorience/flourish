/**
 * Strip private fields from posts before they are handed to client components.
 * Anything returned from a server component to a 'use client' component ends up
 * in the page's HTML/RSC payload, readable by anyone who views source.
 */
type AnyPost = Record<string, any>;

const PRIVATE_POST_FIELDS = ['source_phone', 'location_lat', 'location_lng'] as const;

export function publicPost<T extends AnyPost>(post: T, viewerId?: string | null): T {
  const out: AnyPost = { ...post };
  for (const f of PRIVATE_POST_FIELDS) delete out[f];
  // Only show contact details the poster chose to publish (legacy phone/email posts)
  if (out.contact_method === 'app') out.contact_value = null;
  if (Array.isArray(out.responses)) {
    const isPoster = !!viewerId && out.user_id === viewerId;
    out.responses = out.responses.map((r: AnyPost) => {
      const isResponder = !!viewerId && r.user_id === viewerId;
      if (isPoster || isResponder) return r;
      // Other neighbours see that someone is interested, not what they wrote
      return { ...r, message: null, responder_contact: null };
    });
  }
  return out as T;
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { geocodeCrossStreet, fuzzCoordinates } from '@/lib/geocode';
import { sendEmail, postConfirmationEmail } from '@/lib/email';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// POST /api/posts — create a post with optional geocoding
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    const {
      type, title, details, category, urgency,
      contact_name, contact_method, contact_value,
      source, source_phone, user_id,
      location_label, location_crossstreet,
      location_lat: providedLat, location_lng: providedLng,
    } = body;

    let location_lat = providedLat || null;
    let location_lng = providedLng || null;
    let location_fuzzed_lat = null;
    let location_fuzzed_lng = null;

    // Geocode cross-street if provided (and no direct coords given)
    if (location_crossstreet && !location_lat) {
      const coords = await geocodeCrossStreet(location_crossstreet);
      if (coords) {
        location_lat = coords.lat;
        location_lng = coords.lng;
      }
    }

    // Insert post first to get ID
    const { data: post, error } = await supabase.from('posts').insert({
      type, title, details: details || null,
      category: category || 'other',
      urgency: urgency || 'flexible',
      contact_name, contact_method: contact_method || 'app',
      contact_value: contact_value || null,
      source: source || 'web',
      source_phone: source_phone || null,
      user_id: user_id || null,
      location_label: location_label || null,
      location_crossstreet: location_crossstreet || null,
      location_lat,
      location_lng,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Apply fuzz using post ID as seed
    if (location_lat && location_lng && post) {
      const fuzzed = fuzzCoordinates(location_lat, location_lng, post.id);
      location_fuzzed_lat = fuzzed.lat;
      location_fuzzed_lng = fuzzed.lng;

      await supabase.from('posts')
        .update({ location_fuzzed_lat, location_fuzzed_lng })
        .eq('id', post.id);
    }

    // Send confirmation email if poster provided email
    if (post && contact_method === 'email' && contact_value) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://exchange.clawyard.dev';
      const { subject, html, text } = postConfirmationEmail({
        posterName: contact_name,
        postTitle: title,
        postType: type,
        postUrl: `${appUrl}/post/${post.id}`,
      });
      sendEmail({ to: { email: contact_value, name: contact_name }, subject, html, text })
        .catch(() => {}); // fire-and-forget
    }

    return NextResponse.json({ ok: true, post: { ...post, location_fuzzed_lat, location_fuzzed_lng } });
  } catch (err) {
    console.error('Post creation error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

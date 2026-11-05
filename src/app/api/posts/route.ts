import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { createPost } from '@/lib/posts';
import { isVouchRequired } from '@/lib/settings';
import { rateLimit } from '@/lib/security';

function getSupabase() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// POST /api/posts — create a post (authenticated web users only).
// SMS posts are created directly by the Twilio-verified /api/sms webhook.
export async function POST(req: NextRequest) {
  try {
    const session = await createClient();
    const { data: { user } } = await session.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to post.' }, { status: 401 });
    }

    if (!rateLimit(`post:${user.id}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Slow down a little and try again shortly.' }, { status: 429 });
    }

    if (await isVouchRequired()) {
      const { data: profile } = await session
        .from('profiles')
        .select('vouch_status')
        .eq('id', user.id)
        .single();
      if (!profile || profile.vouch_status === 'unvouched') {
        return NextResponse.json({ error: 'You need to be vouched for before posting.' }, { status: 403 });
      }
    }

    const body = await req.json();
    const result = await createPost(getSupabase(), body, { userId: user.id });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }
    return NextResponse.json({ ok: true, post: result.post });
  } catch (err) {
    console.error('Post creation error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

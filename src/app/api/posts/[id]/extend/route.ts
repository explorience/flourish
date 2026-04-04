import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { POST_EXPIRY_DAYS } from '@/lib/constants';

// Service-role client for DB writes
function getServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = params.id;

  // Auth check — only the post owner can extend
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceSupabase = getServiceSupabase();

  // Fetch the post to verify ownership
  const { data: post, error: fetchError } = await serviceSupabase
    .from('posts')
    .select('id, user_id, status, expires_at')
    .eq('id', postId)
    .single();

  if (fetchError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  if (post.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (post.status !== 'active') {
    return NextResponse.json({ error: 'Only active posts can be extended' }, { status: 400 });
  }

  // Extend from current expires_at (or now if missing) by POST_EXPIRY_DAYS
  const base = post.expires_at ? new Date(post.expires_at) : new Date();
  // If already expired, extend from now
  const extendFrom = base < new Date() ? new Date() : base;
  const newExpiresAt = new Date(extendFrom.getTime() + POST_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const { error: updateError } = await serviceSupabase
    .from('posts')
    .update({
      expires_at: newExpiresAt.toISOString(),
      expiry_reminder_sent: false, // reset so another reminder can be sent
    })
    .eq('id', postId);

  if (updateError) {
    console.error('Extend post error:', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, newExpiresAt: newExpiresAt.toISOString() });
}

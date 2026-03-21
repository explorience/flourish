import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { postId, responderId } = await req.json();
    if (!postId || !responderId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const admin = getAdmin();

    // Verify caller is the poster of this post
    const { data: post } = await admin.from('posts').select('id, user_id, title').eq('id', postId).single();
    if (!post || post.user_id !== user.id) {
      return NextResponse.json({ error: 'Only the poster can start a thread' }, { status: 403 });
    }

    // Upsert thread (unique constraint handles existing threads)
    const { data: thread, error } = await admin
      .from('threads')
      .upsert(
        { post_id: postId, poster_id: user.id, responder_id: responderId },
        { onConflict: 'post_id,poster_id,responder_id', ignoreDuplicates: false }
      )
      .select('id')
      .single();

    if (error) {
      // If upsert failed due to conflict, fetch the existing thread
      const { data: existing } = await admin
        .from('threads')
        .select('id')
        .eq('post_id', postId)
        .eq('poster_id', user.id)
        .eq('responder_id', responderId)
        .single();
      if (existing) return NextResponse.json({ threadId: existing.id });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ threadId: thread.id });
  } catch (err) {
    console.error('Thread create error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

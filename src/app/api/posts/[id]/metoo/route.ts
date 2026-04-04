import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = params.id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if already upvoted
  const { data: existing } = await supabase
    .from('post_upvotes')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single();

  if (existing) {
    // Remove upvote
    await supabase.from('post_upvotes').delete().eq('id', existing.id);
  } else {
    // Add upvote
    await supabase.from('post_upvotes').insert({
      user_id: user.id,
      post_id: postId,
    });
  }

  // Get updated count
  const { count } = await supabase
    .from('post_upvotes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  return NextResponse.json({
    ok: true,
    upvoted: !existing,
    count: count || 0,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = params.id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { count } = await supabase
    .from('post_upvotes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  let upvoted = false;
  if (user) {
    const { data: existing } = await supabase
      .from('post_upvotes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();
    upvoted = !!existing;
  }

  return NextResponse.json({
    count: count || 0,
    upvoted,
  });
}

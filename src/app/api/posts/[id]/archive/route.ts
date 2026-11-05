import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getModeratorByEmail } from '@/lib/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;

    const { data: existing } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Owner or moderator can archive
    const isOwner = existing.user_id === user.id;
    const isModOrAdmin = !isOwner && !!user.email && !!(await getModeratorByEmail(user.email));
    if (!isOwner && !isModOrAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Moderators archive other people's posts, which RLS (correctly) blocks
    // for the user client, so use the service client for that case only.
    const writer = isOwner ? supabase : await createServiceClient();
    const { error: updateError } = await writer
      .from('posts')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Post archive update error:', updateError);
      return NextResponse.json({ error: 'Could not archive post' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Post archive error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

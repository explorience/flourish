import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/block   { userId } — block a user (stops new threads/messages both ways)
 * DELETE /api/block { userId } — unblock
 * Uses the caller's session; RLS on user_blocks (migration 020) limits rows to blocker_id = auth.uid().
 */
async function handle(req: NextRequest, action: 'block' | 'unblock') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { userId } = await req.json().catch(() => ({}));
  if (typeof userId !== 'string' || !UUID.test(userId) || userId === user.id) {
    return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
  }

  const { error } =
    action === 'block'
      ? await supabase
          .from('user_blocks')
          .upsert({ blocker_id: user.id, blocked_id: userId }, { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true })
      : await supabase.from('user_blocks').delete().eq('blocker_id', user.id).eq('blocked_id', userId);

  if (error) {
    console.error(`user_blocks ${action} error:`, error);
    return NextResponse.json({ error: 'Could not update block list' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, blocked: action === 'block' });
}

export async function POST(req: NextRequest) {
  return handle(req, 'block');
}

export async function DELETE(req: NextRequest) {
  return handle(req, 'unblock');
}

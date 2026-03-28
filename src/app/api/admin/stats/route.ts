import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getModeratorByEmail } from '@/lib/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const moderator = await getModeratorByEmail(user.email);
    if (!moderator) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const serviceSupabase = await createServiceClient();

    const [
      { count: total },
      { count: active },
      { count: pending },
      { count: rejected },
      { count: needs },
      { count: offers },
    ] = await Promise.all([
      serviceSupabase.from('posts').select('*', { count: 'exact', head: true }),
      serviceSupabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      serviceSupabase.from('posts').select('*', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
      serviceSupabase.from('posts').select('*', { count: 'exact', head: true }).eq('moderation_status', 'rejected'),
      serviceSupabase.from('posts').select('*', { count: 'exact', head: true }).eq('type', 'need').eq('status', 'active'),
      serviceSupabase.from('posts').select('*', { count: 'exact', head: true }).eq('type', 'offer').eq('status', 'active'),
    ]);

    return NextResponse.json({
      total: total || 0,
      active: active || 0,
      pending: pending || 0,
      rejected: rejected || 0,
      needs: needs || 0,
      offers: offers || 0,
    });
  } catch (err) {
    console.error('Stats route error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

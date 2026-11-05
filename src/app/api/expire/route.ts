import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { POST_EXPIRY_DAYS } from '@/lib/constants';
import { isAuthorizedCron } from '@/lib/security';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Auto-expire old posts. Call via cron daily.
export async function POST(req: NextRequest) {
  // Fails closed if CRON_SECRET is unset.
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - POST_EXPIRY_DAYS);

  const { data, error } = await supabase
    .from('posts')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('created_at', cutoff.toISOString())
    .select('id');

  if (error) {
    console.error('Auto-expire error:', error);
    return NextResponse.json({ error: 'Expire failed' }, { status: 500 });
  }

  return NextResponse.json({ 
    ok: true, 
    expired: data?.length || 0,
    cutoffDate: cutoff.toISOString(),
  });
}

// Vercel Cron issues GET requests (with Authorization: Bearer $CRON_SECRET).
export const GET = POST;

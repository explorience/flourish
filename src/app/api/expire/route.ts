import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { POST_EXPIRY_DAYS } from '@/lib/constants';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Auto-expire old posts. Call via cron daily.
export async function POST(req: NextRequest) {
  // Simple auth check - use a secret or skip for now
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ 
    ok: true, 
    expired: data?.length || 0,
    cutoffDate: cutoff.toISOString(),
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check user is vouched or voucher
    const { data: profile } = await supabase
      .from('profiles')
      .select('vouch_status')
      .eq('id', user.id)
      .single();

    if (!profile || profile.vouch_status === 'unvouched') {
      return NextResponse.json({ error: 'You must be vouched to invite others' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const maxUses = Math.min(body.maxUses || 3, 10);
    const expiresInDays = Math.min(body.expiresInDays || 7, 30);

    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

    const { data: invite, error } = await supabase
      .from('vouch_invites')
      .insert({
        voucher_id: user.id,
        max_uses: maxUses,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Invite error:', error);
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
    const link = `${appUrl}/join?invite=${invite.code}`;

    return NextResponse.json({ ok: true, code: invite.code, link });
  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: invites } = await supabase
      .from('vouch_invites')
      .select('*')
      .eq('voucher_id', user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ ok: true, invites: invites || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Invite code required' }, { status: 400 });
    }

    // Check user isn't already vouched
    const { data: profile } = await supabase
      .from('profiles')
      .select('vouch_status, display_name')
      .eq('id', user.id)
      .single();

    if (profile && profile.vouch_status !== 'unvouched') {
      return NextResponse.json({ error: "You're already vouched!" }, { status: 400 });
    }

    // Look up invite
    const admin = getAdminSupabase();
    const { data: invite } = await admin
      .from('vouch_invites')
      .select('*')
      .eq('code', code.trim().toLowerCase())
      .single();

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invite has expired' }, { status: 410 });
    }

    // Check uses
    if (invite.used_count >= invite.max_uses) {
      return NextResponse.json({ error: 'This invite has been fully used' }, { status: 410 });
    }

    // Can't use own invite
    if (invite.voucher_id === user.id) {
      return NextResponse.json({ error: "You can't use your own invite" }, { status: 400 });
    }

    // Check not already vouched by this person
    const { data: existing } = await supabase
      .from('vouches')
      .select('id')
      .eq('voucher_id', invite.voucher_id)
      .eq('vouchee_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'This person already vouched for you' }, { status: 409 });
    }

    // Create vouch
    await admin.from('vouches').insert({
      voucher_id: invite.voucher_id,
      vouchee_id: user.id,
      context: 'Redeemed invite link',
      status: 'confirmed',
    });

    // Update invite used count
    await admin.from('vouch_invites').update({
      used_count: invite.used_count + 1,
    }).eq('id', invite.id);

    // Ensure profile exists, then update
    await admin.from('profiles').upsert({
      id: user.id,
      display_name: profile?.display_name || user.email?.split('@')[0] || '',
      vouch_status: 'vouched',
      vouch_count: 1,
    }, { onConflict: 'id' });

    // Notify the voucher
    try {
      const { data: { user: voucher } } = await admin.auth.admin.getUserById(invite.voucher_id);
      const { data: voucherProfile } = await admin.from('profiles').select('display_name').eq('id', invite.voucher_id).single();
      if (voucher?.email) {
        const displayName = profile?.display_name || user.email?.split('@')[0] || 'Someone';
        const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Flourish';
        await sendEmail({
          to: { email: voucher.email, name: voucherProfile?.display_name || undefined },
          subject: `${displayName} joined ${appName} with your invite!`,
          html: `
            <div style="max-width:560px;margin:0 auto;padding:40px 20px;background:#1a2a20;font-family:Georgia,serif;">
              <div style="background:#f0ece0;padding:36px;">
                <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:0.15em;color:#7a8a78;margin-bottom:8px;">Invite redeemed</div>
                <h1 style="font-size:22px;color:#1a2a20;margin:0 0 16px;">${displayName} joined with your invite!</h1>
                <p style="font-size:15px;color:#4a5a48;">Your invite code was used. They're now a trusted member of the community.</p>
              </div>
            </div>
          `,
          text: `${displayName} joined ${appName} with your invite! They're now a trusted member of the community.`,
        });
      }
    } catch (e) {
      console.error('Invite redemption notification failed:', e);
    }

    return NextResponse.json({ ok: true, vouched: true });
  } catch (error) {
    console.error('Redeem error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

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

    const { voucheeId, context } = await req.json();
    if (!voucheeId) {
      return NextResponse.json({ error: 'voucheeId required' }, { status: 400 });
    }

    // Can't vouch for yourself
    if (voucheeId === user.id) {
      return NextResponse.json({ error: "You can't vouch for yourself" }, { status: 400 });
    }

    // Check voucher is vouched or voucher status
    const { data: voucherProfile } = await supabase
      .from('profiles')
      .select('vouch_status, display_name')
      .eq('id', user.id)
      .single();

    if (!voucherProfile || voucherProfile.vouch_status === 'unvouched') {
      return NextResponse.json({ error: 'You must be vouched to vouch for others' }, { status: 403 });
    }

    // Check vouchee exists
    const { data: voucheeProfile } = await supabase
      .from('profiles')
      .select('id, display_name, vouch_status')
      .eq('id', voucheeId)
      .single();

    if (!voucheeProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check no existing vouch
    const { data: existing } = await supabase
      .from('vouches')
      .select('id')
      .eq('voucher_id', user.id)
      .eq('vouchee_id', voucheeId)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'You already vouched for this person' }, { status: 409 });
    }

    // Create vouch
    const { data: vouch, error: vouchError } = await supabase
      .from('vouches')
      .insert({
        voucher_id: user.id,
        vouchee_id: voucheeId,
        context: context?.trim() || null,
        status: 'confirmed',
      })
      .select()
      .single();

    if (vouchError) {
      console.error('Vouch error:', vouchError);
      return NextResponse.json({ error: 'Failed to create vouch' }, { status: 500 });
    }

    // Update vouchee profile using admin client (bypass RLS)
    const admin = getAdminSupabase();
    
    // Update vouch_status if currently unvouched, and increment vouch_count
    if (voucheeProfile.vouch_status === 'unvouched') {
      await admin.from('profiles').update({ 
        vouch_status: 'vouched',
        vouch_count: (voucheeProfile as any).vouch_count ? (voucheeProfile as any).vouch_count + 1 : 1
      }).eq('id', voucheeId);
    } else {
      try {
        await admin.rpc('increment_vouch_count', { profile_id: voucheeId });
      } catch {
        // Fallback if RPC doesn't exist
        await admin.from('profiles').update({ 
          vouch_count: ((voucheeProfile as any).vouch_count || 0) + 1 
        }).eq('id', voucheeId);
      }
    }

    // Send notification email to vouchee
    try {
      const { data: { user: voucheeUser } } = await admin.auth.admin.getUserById(voucheeId);
      if (voucheeUser?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
        const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Flourish';
        await sendEmail({
          to: { email: voucheeUser.email, name: voucheeProfile.display_name || undefined },
          subject: `${voucherProfile.display_name} vouched for you on ${appName}!`,
          html: `
            <div style="max-width:560px;margin:0 auto;padding:40px 20px;background:#1a2a20;font-family:Georgia,serif;">
              <div style="background:#f0ece0;padding:36px;">
                <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:0.15em;color:#7a8a78;margin-bottom:8px;">Welcome to the community</div>
                <h1 style="font-size:22px;color:#1a2a20;margin:0 0 16px;line-height:1.3;">${voucherProfile.display_name} vouched for you!</h1>
                <p style="font-size:15px;color:#4a5a48;margin:0 0 8px;">You're now a trusted member of ${appName}. You can post needs and offers, respond to others, and vouch for people you know.</p>
                ${context ? `<p style="font-size:14px;color:#7a8a78;margin:16px 0 0;font-style:italic;">"${context}"</p>` : ''}
                <a href="${appUrl}" style="display:block;margin-top:28px;padding:14px 24px;background:#3a6a4a;color:#f0ece0;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;text-align:center;">Start exchanging</a>
              </div>
            </div>
          `,
          text: `${voucherProfile.display_name} vouched for you on ${appName}! You can now post needs and offers. Visit ${appUrl}`,
        });
      }
    } catch (e) {
      console.error('Vouch notification email failed:', e);
    }

    return NextResponse.json({ ok: true, vouchId: vouch.id });
  } catch (error) {
    console.error('Vouch error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

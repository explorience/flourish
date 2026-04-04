import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const cronSecret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Flourish';

  // Get posts from last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, type, title, contact_name, created_at')
    .eq('status', 'active')
    .or('moderation_status.eq.approved,moderation_status.is.null')
    .gte('created_at', since)
    .order('created_at', { ascending: false });

  if (!recentPosts || recentPosts.length === 0) {
    return NextResponse.json({ ok: true, message: 'No new posts in last 24h', sent: 0 });
  }

  // Get users who want digest emails
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, email_notifications')
    .eq('email_notifications', true);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ ok: true, message: 'No subscribed users', sent: 0 });
  }

  const needs = recentPosts.filter(p => p.type === 'need');
  const offers = recentPosts.filter(p => p.type === 'offer');

  const postListHtml = (posts: typeof recentPosts, color: string) =>
    posts.map(p => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px dashed #c8c0b0;">
          <a href="${appUrl}/post/${p.id}" style="color: ${color}; text-decoration: none; font-family: Georgia, serif; font-size: 15px;">
            ${escapeHtml(p.title)}
          </a>
          <div style="font-family: Arial, sans-serif; font-size: 11px; color: #7a8a78; margin-top: 2px;">
            by ${escapeHtml(p.contact_name)}
          </div>
        </td>
      </tr>
    `).join('');

  const subject = `${recentPosts.length} new ${recentPosts.length === 1 ? 'post' : 'posts'} on ${appName} today`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; background: #1a2a20; font-family: Georgia, serif; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #f0ece0; padding: 36px; }
    .label { font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; color: #7a8a78; margin-bottom: 8px; }
    .title { font-size: 22px; color: #1a2a20; margin: 0 0 8px; line-height: 1.3; }
    .subtitle { font-size: 14px; color: #4a5a48; margin: 0 0 24px; }
    .section { margin-top: 20px; }
    .section-label { font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; }
    .cta { display: block; margin-top: 28px; padding: 14px 24px; background: #3a6a4a; color: #f0ece0 !important; text-decoration: none; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; text-align: center; }
    .footer { margin-top: 24px; font-family: Arial, sans-serif; font-size: 11px; color: #5a7a60; text-align: center; line-height: 1.6; }
    .footer a { color: #5a7a60; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="label">Daily digest</div>
      <h1 class="title">${recentPosts.length} new ${recentPosts.length === 1 ? 'post' : 'posts'} today</h1>
      <p class="subtitle">Here's what your neighbours shared in the last 24 hours.</p>

      ${needs.length > 0 ? `
      <div class="section">
        <div class="section-label" style="color: #d07040;">Needs (${needs.length})</div>
        <table width="100%" cellpadding="0" cellspacing="0">${postListHtml(needs, '#d07040')}</table>
      </div>` : ''}

      ${offers.length > 0 ? `
      <div class="section">
        <div class="section-label" style="color: #3a6a4a;">Offers (${offers.length})</div>
        <table width="100%" cellpadding="0" cellspacing="0">${postListHtml(offers, '#3a6a4a')}</table>
      </div>` : ''}

      <a href="${appUrl}" class="cta">Browse the board &rarr;</a>
    </div>

    <div class="footer">
      <p><a href="${appUrl}">${appName}</a> — community exchange board</p>
      <p>You can turn off these emails from your <a href="${appUrl}/account">account settings</a>.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `${recentPosts.length} new posts on ${appName} today\n\n${recentPosts.map(p => `- [${p.type.toUpperCase()}] ${p.title} by ${p.contact_name}\n  ${appUrl}/post/${p.id}`).join('\n')}\n\nBrowse: ${appUrl}\n\nTo unsubscribe, visit ${appUrl}/account`;

  // Send to each subscribed user
  let sent = 0;
  for (const profile of profiles) {
    try {
      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
      if (user?.email) {
        const ok = await sendEmail({
          to: { email: user.email, name: profile.display_name || undefined },
          subject,
          html,
          text,
        });
        if (ok) sent++;
      }
    } catch (err) {
      console.error(`Digest email failed for ${profile.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent, total: profiles.length, posts: recentPosts.length });
}

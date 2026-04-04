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
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function expiryReminderEmail({
  posterName,
  postTitle,
  postType,
  postUrl,
  extendUrl,
  appUrl,
  appName,
  daysLeft,
}: {
  posterName: string;
  postTitle: string;
  postType: 'need' | 'offer';
  postUrl: string;
  extendUrl: string;
  appUrl: string;
  appName: string;
  daysLeft: number;
}) {
  const accentColor = postType === 'need' ? '#d07040' : '#3a6a4a';
  const subject = `Your ${postType} "${postTitle}" expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; background: #1a2a20; font-family: Georgia, serif; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #f0ece0; padding: 36px; }
    .label { font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; color: #7a8a78; margin-bottom: 8px; }
    .title { font-size: 22px; color: #1a2a20; margin: 0 0 12px; line-height: 1.3; }
    .body { font-size: 15px; color: #4a5a48; line-height: 1.7; margin: 0 0 28px; }
    .actions { display: block; }
    .btn { display: block; margin-bottom: 12px; padding: 14px 24px; text-decoration: none; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; text-align: center; }
    .btn-primary { background: ${accentColor}; color: #f0ece0 !important; }
    .btn-secondary { background: transparent; color: #3a6a4a !important; border: 1.5px solid #3a6a4a; }
    .btn-muted { background: transparent; color: #7a8a78 !important; border: 1.5px solid #c8c0b0; }
    .divider { border: none; border-top: 1px dashed #c8c0b0; margin: 24px 0; }
    .note { font-family: Arial, sans-serif; font-size: 12px; color: #7a8a78; line-height: 1.5; }
    .footer { margin-top: 24px; font-family: Arial, sans-serif; font-size: 11px; color: #5a7a60; text-align: center; line-height: 1.6; }
    .footer a { color: #5a7a60; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="label">Post expiring soon</div>
      <h1 class="title">${escapeHtml(postTitle)}</h1>
      <p class="body">
        Hi ${escapeHtml(posterName)}, your ${postType} expires in <strong>${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}</strong>.
        Let us know what you'd like to do with it.
      </p>

      <div class="actions">
        <a href="${extendUrl}" class="btn btn-primary">Extend for 30 more days &rarr;</a>
        <a href="${postUrl}?action=fulfilled" class="btn btn-secondary">Mark as fulfilled</a>
        <a href="${postUrl}?action=expired" class="btn btn-muted">Let it expire</a>
      </div>

      <hr class="divider">
      <p class="note">
        If you do nothing, this post will be automatically closed when it expires.<br>
        View your post: <a href="${postUrl}" style="color: #3a6a4a;">${postUrl}</a>
      </p>
    </div>

    <div class="footer">
      <p><a href="${appUrl}">${appName}</a> — community exchange board</p>
      <p>You received this because you have an active post. Manage your posts at <a href="${appUrl}/account">your account</a>.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${posterName},

Your ${postType} "${postTitle}" expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}.

What would you like to do?

• Extend for 30 more days: ${extendUrl}
• Mark as fulfilled: ${postUrl}?action=fulfilled
• Let it expire: ${postUrl}?action=expired

If you do nothing, this post will be automatically closed when it expires.

---
${appName} — community exchange board
${appUrl}`;

  return { subject, html, text };
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

  // Find active posts expiring within 3 days that haven't had a reminder sent
  const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const { data: expiringPosts, error } = await supabase
    .from('posts')
    .select('id, type, title, contact_name, contact_value, contact_method, user_id, expires_at')
    .eq('status', 'active')
    .or('moderation_status.eq.approved,moderation_status.is.null')
    .eq('expiry_reminder_sent', false)
    .lt('expires_at', in3Days)
    .gt('expires_at', now)
    .order('expires_at', { ascending: true });

  if (error) {
    console.error('Expiry check query error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!expiringPosts || expiringPosts.length === 0) {
    return NextResponse.json({ ok: true, message: 'No posts expiring soon', sent: 0 });
  }

  let sent = 0;
  let failed = 0;

  for (const post of expiringPosts) {
    try {
      // Resolve recipient email
      let recipientEmail: string | null = null;
      let recipientName = post.contact_name;

      // Prefer auth email for logged-in users
      if (post.user_id) {
        try {
          const { data: { user } } = await supabase.auth.admin.getUserById(post.user_id);
          recipientEmail = user?.email || null;
        } catch {}
      }

      // Fallback: contact_value if contact_method is email
      if (!recipientEmail && post.contact_method === 'email' && post.contact_value) {
        recipientEmail = post.contact_value;
      }

      if (!recipientEmail) {
        // No email available — mark reminder sent to avoid repeated checks
        await supabase.from('posts').update({ expiry_reminder_sent: true }).eq('id', post.id);
        continue;
      }

      // Calculate days left
      const expiresAt = new Date(post.expires_at);
      const msLeft = expiresAt.getTime() - Date.now();
      const daysLeft = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

      const postUrl = `${appUrl}/post/${post.id}`;
      const extendUrl = `${appUrl}/api/posts/${post.id}/extend`;

      const { subject, html, text } = expiryReminderEmail({
        posterName: recipientName,
        postTitle: post.title,
        postType: post.type,
        postUrl,
        extendUrl,
        appUrl,
        appName,
        daysLeft,
      });

      const ok = await sendEmail({
        to: { email: recipientEmail, name: recipientName },
        subject,
        html,
        text,
      });

      // Mark reminder sent regardless of email success (avoid spam on retry)
      await supabase.from('posts').update({ expiry_reminder_sent: true }).eq('id', post.id);

      if (ok) {
        sent++;
      } else {
        failed++;
      }
    } catch (err) {
      console.error(`Expiry reminder failed for post ${post.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    failed,
    total: expiringPosts.length,
  });
}

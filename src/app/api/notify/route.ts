import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSessionClient } from '@/lib/supabase/server';
import { sendEmail, responseNotificationEmail } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';
import { rateLimit } from '@/lib/security';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// How recently the caller must have responded for a notification to be sent.
const RESPONSE_WINDOW_MS = 10 * 60 * 1000;

/**
 * POST /api/notify — tell a poster that the signed-in caller just responded.
 *
 * The notification content is taken from the caller's own stored response row,
 * not from the request body, so this can't be used to send arbitrary
 * email/SMS/push content to arbitrary posters.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await createSessionClient();
    const { data: { user } } = await session.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { postId } = await req.json();
    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ error: 'postId required' }, { status: 400 });
    }

    if (!rateLimit(`notify:${user.id}`, 10, 60 * 60 * 1000) || !rateLimit(`notify:${user.id}:${postId}`, 1, RESPONSE_WINDOW_MS)) {
      return NextResponse.json({ ok: true, notified: false, throttled: true });
    }

    const supabase = getSupabase();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

    const { data: post } = await supabase
      .from('posts')
      .select('id, user_id, title, type, contact_name, contact_method, contact_value, source, source_phone')
      .eq('id', postId)
      .single();

    if (!post || post.user_id === user.id) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // The caller must have a fresh response on this post.
    const since = new Date(Date.now() - RESPONSE_WINDOW_MS).toISOString();
    const { data: response } = await supabase
      .from('responses')
      .select('id, responder_name, message, created_at')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!response) {
      return NextResponse.json({ error: 'No recent response found' }, { status: 403 });
    }

    const responderName: string = (response.responder_name || 'A neighbour').slice(0, 80);
    const responderMessage: string | null = response.message ? String(response.message).slice(0, 1000) : null;

    const postUrl = `${appUrl}/post/${postId}`;
    let notified = false;

    // Check email preference if user has a profile
    let emailEnabled = true;
    if (post.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_notifications')
        .eq('id', post.user_id)
        .single();
      if (profile && profile.email_notifications === false) {
        emailEnabled = false;
      }
    }

    const emailContent = () =>
      responseNotificationEmail({
        posterName: post.contact_name,
        postTitle: post.title,
        postType: post.type,
        responderName,
        responderContact: null,
        responderMessage,
        postUrl,
      });

    // 1. Email notification for logged-in users
    if (emailEnabled && post.user_id) {
      const { data: { user: poster } } = await supabase.auth.admin.getUserById(post.user_id);
      if (poster?.email) {
        const { subject, html, text } = emailContent();
        notified = await sendEmail({ to: { email: poster.email, name: post.contact_name }, subject, html, text });
      }
    }

    // 2. Fallback for legacy anonymous posts that listed an email contact
    if (!notified && emailEnabled && !post.user_id && post.contact_method === 'email' && post.contact_value) {
      const { subject, html, text } = emailContent();
      notified = await sendEmail({ to: { email: post.contact_value, name: post.contact_name }, subject, html, text });
    }

    // 3. Push notification for logged-in users
    if (post.user_id) {
      const pushTitle = `${responderName} responded to "${post.title}"`;
      const pushBody = responderMessage
        ? responderMessage.slice(0, 120)
        : `Someone wants to ${post.type === 'need' ? 'help' : 'connect'} with your ${post.type}.`;
      sendPushNotification(post.user_id, pushTitle, pushBody, postUrl).catch(
        (err) => console.error('Push notification error:', err)
      );
    }

    // 4. SMS notification — only for posts that came in via SMS
    if (!notified && post.source === 'sms') {
      let phone: string | null = null;
      const { data: contact } = await supabase
        .from('post_sms_contacts')
        .select('phone')
        .eq('post_id', postId)
        .maybeSingle();
      phone = contact?.phone || post.source_phone || null;

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      if (phone && accountSid && authToken && twilioPhone) {
        // Responders' contact details are never forwarded; replies happen in-app.
        const message = [
          `Someone responded to your Flourish post: "${post.title}"`,
          `From: ${responderName}`,
          responderMessage ? `"${responderMessage.slice(0, 100)}"` : null,
          `View: ${postUrl}`,
        ]
          .filter(Boolean)
          .join('\n');

        const body = new URLSearchParams({ To: phone, From: twilioPhone, Body: message });

        const twilioRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
          }
        );

        notified = twilioRes.ok;
      }
    }

    return NextResponse.json({ ok: true, notified });
  } catch (error) {
    console.error('Notify error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

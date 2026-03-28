import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, responseNotificationEmail } from '@/lib/email';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { postId, responderName, responderContact, responderMessage } = await req.json();
    const supabase = getSupabase();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

    const { data: post } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (!post) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const postUrl = `${appUrl}/post/${postId}`;
    let notified = false;

    // 1. Email notification — for web users who provided email as contact method
    if (post.contact_method === 'email' && post.contact_value) {
      const { subject, html, text } = responseNotificationEmail({
        posterName: post.contact_name,
        postTitle: post.title,
        postType: post.type,
        responderName,
        responderContact,
        responderMessage,
        postUrl,
      });

      notified = await sendEmail({
        to: { email: post.contact_value, name: post.contact_name },
        subject,
        html,
        text,
      });
    }

    // 2. SMS notification — only for posts that came in via SMS (people without web/email access)
    //    This keeps SMS costs down while still reaching people who need it
    if (!notified && post.source === 'sms' && post.source_phone) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      if (accountSid && authToken && twilioPhone) {
        const message = [
          `Someone responded to your Flourish post: "${post.title}"`,
          responderName ? `From: ${responderName}` : null,
          responderMessage ? `"${responderMessage.slice(0, 100)}"` : null,
          responderContact ? `Reach them at: ${responderContact}` : null,
          `View: ${postUrl}`,
        ]
          .filter(Boolean)
          .join('\n');

        const body = new URLSearchParams({
          To: post.source_phone,
          From: twilioPhone,
          Body: message,
        });

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

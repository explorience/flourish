import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const { data: post } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (!post || !post.source_phone) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Build a warm, informative notification
    let message = `Good news - ${responderName} responded to your post about "${post.title}".`;
    
    if (responderMessage) {
      message += `\n\nThey said: "${responderMessage}"`;
    }
    
    if (responderContact) {
      message += `\n\nReach them at: ${responderContact}`;
    }

    message += `\n\nView your post: ${process.env.NEXT_PUBLIC_APP_URL || 'https://exchange.clawyard.dev'}/post/${post.id}`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: post.source_phone, From: twilioPhone, Body: message }).toString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Notify error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

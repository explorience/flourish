import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { threadId, content } = await req.json();
    if (!threadId || !content?.trim()) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const admin = getAdmin();

    // Verify sender is a participant
    const { data: thread } = await admin
      .from('threads')
      .select('id, post_id, poster_id, responder_id, posts(title)')
      .eq('id', threadId)
      .single();

    if (!thread || (thread.poster_id !== user.id && thread.responder_id !== user.id)) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
    }

    // Insert message
    const { data: message, error } = await admin
      .from('messages')
      .insert({ thread_id: threadId, sender_id: user.id, content: content.trim() })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update thread.last_message_at
    await admin.from('threads').update({ last_message_at: new Date().toISOString() }).eq('id', threadId);

    // Email notification to the recipient (not the sender)
    const recipientId = thread.poster_id === user.id ? thread.responder_id : thread.poster_id;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flourish.ourlondon.xyz';
    const threadUrl = `${appUrl}/messages/${threadId}`;
    const postTitle = (thread.posts as any)?.title || 'your post';

    try {
      const { data: recipientData } = await admin.auth.admin.getUserById(recipientId);
      const recipientEmail = recipientData?.user?.email;
      const recipientName = recipientData?.user?.user_metadata?.name || 'there';

      if (recipientEmail) {
        await sendEmail({
          to: { email: recipientEmail, name: recipientName },
          subject: `New message about "${postTitle}"`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f0ece0; color: #2c3a2e;">
              <p style="font-size: 18px; margin-bottom: 8px;">Hey ${recipientName},</p>
              <p style="margin-bottom: 24px; color: #4a5c4e;">Someone sent you a message about <strong>${postTitle}</strong>.</p>
              <a href="${threadUrl}" style="display: inline-block; background: #1a2a20; color: #f0ece0; padding: 12px 24px; text-decoration: none; font-family: sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase;">View Conversation</a>
              <p style="margin-top: 32px; font-size: 12px; color: #7a8a78;">Flourish · London Community Exchange</p>
            </div>
          `,
          text: `New message about "${postTitle}" on Flourish. View it here: ${threadUrl}`,
        });
      }
    } catch (emailErr) {
      console.error('Email notification failed (non-fatal):', emailErr);
    }

    return NextResponse.json({ message });
  } catch (err) {
    console.error('Message send error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

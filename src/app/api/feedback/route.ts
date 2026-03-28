import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const fromName = name?.trim() || 'Anonymous';
    const fromEmail = email?.trim() || null;

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
    .title { font-size: 22px; color: #1a2a20; margin: 0 0 24px; line-height: 1.3; font-family: Arial, sans-serif; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
    .section { border-top: 1px dashed #c8c0b0; padding-top: 16px; margin-top: 16px; }
    .field-label { font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.12em; color: #7a8a78; margin-bottom: 6px; }
    .field-value { font-size: 15px; color: #1a2a20; line-height: 1.6; }
    .message-block { padding: 16px; background: #fff; border-left: 3px solid #3a6a4a; margin-top: 4px; font-size: 15px; color: #4a5a48; line-height: 1.7; white-space: pre-wrap; }
    .footer { margin-top: 24px; font-family: Arial, sans-serif; font-size: 11px; color: #5a7a60; text-align: center; line-height: 1.6; }
    .footer a { color: #5a7a60; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="label">Flourish — Feedback</div>
      <h1 class="title">New Feedback</h1>

      <div class="section">
        <div class="field-label">From</div>
        <div class="field-value">${escapeHtml(fromName)}${fromEmail ? ` &lt;${escapeHtml(fromEmail)}&gt;` : ' (no email provided)'}</div>
      </div>

      <div class="section">
        <div class="field-label">Message</div>
        <div class="message-block">${escapeHtml(message.trim())}</div>
      </div>
    </div>

    <div class="footer">
      <p>Sent via <a href="https://flourish.ourlondon.xyz">Flourish</a> — community exchange board for London, Ontario.</p>
    </div>
  </div>
</body>
</html>`;

    const text = `New feedback from Flourish

From: ${fromName}${fromEmail ? ` <${fromEmail}>` : ' (no email)'}

Message:
${message.trim()}

---
Flourish — flourish.ourlondon.xyz`;

    const sent = await sendEmail({
      to: { email: '1heenal@gmail.com', name: 'Flourish Admin' },
      subject: `Flourish Feedback — from ${fromName}`,
      html,
      text,
    });

    if (!sent) {
      // Still return success to user — don't expose infra issues
      console.error('Feedback email send failed, but returning success to client');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Feedback route error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}

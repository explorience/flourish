/**
 * Brevo (formerly Sendinblue) transactional email sender.
 */

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

interface SendEmailParams {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn('BREVO_API_KEY not set — skipping email');
    return false;
  }

  const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@flourish.ourlondon.xyz';
  const fromName = process.env.BREVO_FROM_NAME || 'Flourish';

  try {
    const res = await fetch(BREVO_API, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: params.to.email, name: params.to.name || '' }],
        subject: params.subject,
        htmlContent: params.html,
        textContent: params.text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Brevo send error:', res.status, err);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Brevo send failed:', err);
    return false;
  }
}

/**
 * Email template: someone responded to your post
 */
export function responseNotificationEmail({
  posterName,
  postTitle,
  postType,
  responderName,
  responderContact,
  responderMessage,
  postUrl,
}: {
  posterName: string;
  postTitle: string;
  postType: 'need' | 'offer';
  responderName: string;
  responderContact?: string | null;
  responderMessage?: string | null;
  postUrl: string;
}) {
  const actionWord = postType === 'need' ? 'help with' : 'interest in';
  const subject = `${responderName} wants to ${postType === 'need' ? 'help' : 'connect'} — "${postTitle}"`;

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
    .title { font-size: 22px; color: #1a2a20; margin: 0 0 24px; line-height: 1.3; }
    .section { border-top: 1px dashed #c8c0b0; padding-top: 16px; margin-top: 16px; }
    .responder-name { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #1a2a20; }
    .message { font-size: 15px; color: #4a5a48; margin: 8px 0 0; line-height: 1.6; }
    .contact { font-family: Arial, sans-serif; font-size: 13px; color: #5a7a60; margin-top: 8px; }
    .cta { display: block; margin-top: 28px; padding: 14px 24px; background: #3a6a4a; color: #f0ece0 !important; text-decoration: none; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; text-align: center; }
    .footer { margin-top: 24px; font-family: Arial, sans-serif; font-size: 11px; color: #5a7a60; text-align: center; line-height: 1.6; }
    .footer a { color: #5a7a60; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="label">Response to your ${postType}</div>
      <h1 class="title">${escapeHtml(postTitle)}</h1>

      <div class="section">
        <div class="responder-name">${escapeHtml(responderName)}</div>
        <div class="message">has expressed ${actionWord} your post.</div>
        ${responderMessage ? `<div class="message" style="margin-top:12px;padding:12px;background:#fff;border-left:3px solid #3a6a4a;">"${escapeHtml(responderMessage)}"</div>` : ''}
        ${responderContact ? `<div class="contact">How to reach them: <strong>${escapeHtml(responderContact)}</strong></div>` : ''}
      </div>

      <a href="${postUrl}" class="cta">View your post &rarr;</a>
    </div>

    <div class="footer">
      <p>This is a notification from <a href="https://flourish.ourlondon.xyz">Flourish</a>, a community exchange board for London, Ontario.</p>
      <p>You received this because someone responded to your post. No account needed to use Flourish.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${posterName},

${responderName} responded to your ${postType}: "${postTitle}"

${responderMessage ? `Their message: "${responderMessage}"\n\n` : ''}${responderContact ? `How to reach them: ${responderContact}\n\n` : ''}View your post: ${postUrl}

---
Flourish — community exchange board for London, ON
flourish.ourlondon.xyz`;

  return { subject, html, text };
}

/**
 * Email template: your post is now live
 */
export function postConfirmationEmail({
  posterName,
  postTitle,
  postType,
  postUrl,
}: {
  posterName: string;
  postTitle: string;
  postType: 'need' | 'offer';
  postUrl: string;
}) {
  const subject = `Your ${postType} is live on Flourish`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background: #1a2a20; font-family: Georgia, serif; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #f0ece0; padding: 36px; }
    .label { font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; color: ${postType === 'need' ? '#d07040' : '#3a6a4a'}; margin-bottom: 8px; }
    .title { font-size: 22px; color: #1a2a20; margin: 0 0 16px; line-height: 1.3; }
    .body { font-size: 15px; color: #4a5a48; line-height: 1.6; }
    .cta { display: block; margin-top: 28px; padding: 14px 24px; background: ${postType === 'need' ? '#d07040' : '#3a6a4a'}; color: #f0ece0 !important; text-decoration: none; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; text-align: center; }
    .footer { margin-top: 24px; font-family: Arial, sans-serif; font-size: 11px; color: #5a7a60; text-align: center; line-height: 1.6; }
    .footer a { color: #5a7a60; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="label">${postType} posted</div>
      <h1 class="title">${escapeHtml(postTitle)}</h1>
      <p class="body">Hi ${escapeHtml(posterName)}, your ${postType} is now live on the board. We'll email you when someone responds.</p>
      <a href="${postUrl}" class="cta">View your post &rarr;</a>
    </div>
    <div class="footer">
      <p><a href="https://flourish.ourlondon.xyz">Flourish</a> — community exchange board for London, ON</p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${posterName},

Your ${postType} is now live: "${postTitle}"

View it here: ${postUrl}

We'll email you when someone responds.

---
Flourish — flourish.ourlondon.xyz`;

  return { subject, html, text };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

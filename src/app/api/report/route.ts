import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import { escapeHtml, rateLimit } from '@/lib/security';

const TARGETS = ['post', 'user', 'message', 'response'] as const;

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

/**
 * POST /api/report — signed-in users flag a post, user, message or response.
 * Body: { targetType: 'post'|'user'|'message'|'response', targetId: uuid, reason: string }
 * Stored in `reports` (migration 020) and emailed to ADMIN_EMAIL.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Please sign in to report.' }, { status: 401 });

    if (!rateLimit(`report:${user.id}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many reports, please try later.' }, { status: 429 });
    }

    const { targetType, targetId, reason } = await req.json();
    if (!TARGETS.includes(targetType) || typeof targetId !== 'string' || !/^[0-9a-f-]{36}$/i.test(targetId)) {
      return NextResponse.json({ error: 'Invalid report target' }, { status: 400 });
    }
    const cleanReason = typeof reason === 'string' ? reason.trim().slice(0, 2000) : '';

    const admin = getAdmin();
    const { error } = await admin.from('reports').insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason: cleanReason || null,
    });
    if (error) console.error('Report insert error:', error);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
    const link = targetType === 'post' ? `${appUrl}/post/${targetId}` : `${appUrl}/admin`;
    await sendEmail({
      to: { email: process.env.ADMIN_EMAIL || 'admin@example.com', name: 'Flourish Admin' },
      subject: `Flourish report: ${targetType}`,
      html: `<p>A ${escapeHtml(targetType)} was reported.</p>
<p><strong>Target:</strong> ${escapeHtml(targetId)}<br><strong>Reporter:</strong> ${escapeHtml(user.id)}</p>
<p><strong>Reason:</strong></p><pre style="white-space:pre-wrap">${escapeHtml(cleanReason || '(none given)')}</pre>
<p><a href="${escapeHtml(link)}">Review</a></p>`,
      text: `A ${targetType} was reported.\nTarget: ${targetId}\nReporter: ${user.id}\nReason: ${cleanReason || '(none given)'}\n${link}`,
    }).catch(() => false);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Report route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

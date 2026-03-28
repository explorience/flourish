import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getModeratorByEmail } from '@/lib/admin';

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const moderator = await getModeratorByEmail(user.email);
    if (!moderator) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await req.json();
    const { postId, action, reason } = body;

    if (!postId || !action) {
      return NextResponse.json({ error: 'postId and action are required.' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve or reject.' }, { status: 400 });
    }

    const serviceSupabase = await createServiceClient();

    // Update the post
    const newModerationStatus = action === 'approve' ? 'approved' : 'rejected';
    const { error: updateError } = await serviceSupabase
      .from('posts')
      .update({
        moderation_status: newModerationStatus,
        moderated_at: new Date().toISOString(),
        rejection_reason: action === 'reject' ? (reason || null) : null,
      })
      .eq('id', postId);

    if (updateError) {
      console.error('Moderation update error:', updateError);
      return NextResponse.json({ error: 'Failed to update post.' }, { status: 500 });
    }

    // Log the action
    const { error: logError } = await serviceSupabase
      .from('moderation_log')
      .insert({
        post_id: postId,
        moderator_id: moderator.id,
        action,
        reason: reason || null,
      });

    if (logError) {
      // Non-fatal — log but continue
      console.error('Moderation log insert error:', logError);
    }

    return NextResponse.json({ success: true, action, postId });
  } catch (err) {
    console.error('Admin moderate route error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

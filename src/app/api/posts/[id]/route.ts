import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PUT /api/posts/[id] — update a post (owner only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Fetch existing post to verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, details, category, urgency, image_urls } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        details: details?.trim() || null,
        category: category || 'other',
        urgency: urgency || 'flexible',
        updated_at: new Date().toISOString(),
        image_urls: image_urls !== undefined ? (image_urls || []) : undefined,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, post: updated });
  } catch (err) {
    console.error('Post update error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeImageUrls } from '@/lib/security';

const CATEGORIES = ['items', 'services', 'skills', 'space', 'other'];
const URGENCIES = ['flexible', 'this_week', 'today'];

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

    if (typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('posts')
      .update({
        title: title.trim().slice(0, 200),
        details: typeof details === 'string' ? details.trim().slice(0, 5000) || null : null,
        category: CATEGORIES.includes(category) ? category : 'other',
        urgency: URGENCIES.includes(urgency) ? urgency : 'flexible',
        updated_at: new Date().toISOString(),
        image_urls: image_urls !== undefined ? sanitizeImageUrls(image_urls) : undefined,
      })
      .eq('id', id)
      .eq('user_id', user.id)
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

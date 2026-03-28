import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getModeratorByEmail } from '@/lib/admin';

// GET — list all moderators (admin only)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const moderator = await getModeratorByEmail(user.email);
    if (!moderator || moderator.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const serviceSupabase = await createServiceClient();
    const { data, error } = await serviceSupabase
      .from('moderators')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch moderators.' }, { status: 500 });
    }

    return NextResponse.json({ moderators: data });
  } catch (err) {
    console.error('GET moderators error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// POST — add a moderator by email (admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const moderator = await getModeratorByEmail(user.email);
    if (!moderator || moderator.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { email, name, role = 'mod' } = body;

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    if (!['admin', 'mod'].includes(role)) {
      return NextResponse.json({ error: 'Role must be admin or mod.' }, { status: 400 });
    }

    const serviceSupabase = await createServiceClient();
    const { data, error } = await serviceSupabase
      .from('moderators')
      .insert({
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        role,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This email is already a moderator.' }, { status: 409 });
      }
      console.error('Add moderator error:', error);
      return NextResponse.json({ error: 'Failed to add moderator.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, moderator: data });
  } catch (err) {
    console.error('POST moderators error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// DELETE — remove a moderator by id (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const moderator = await getModeratorByEmail(user.email);
    if (!moderator || moderator.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    // Prevent self-removal
    if (moderator.id === id) {
      return NextResponse.json({ error: 'You cannot remove yourself.' }, { status: 400 });
    }

    const serviceSupabase = await createServiceClient();
    const { error } = await serviceSupabase
      .from('moderators')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Remove moderator error:', error);
      return NextResponse.json({ error: 'Failed to remove moderator.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE moderators error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

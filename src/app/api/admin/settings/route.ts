import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from('app_settings')
      .select('key, value')
      .order('key');

    const settings: Record<string, any> = {};
    for (const row of data || []) {
      settings[row.key] = row.value;
    }
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Admin only
    if (!(await isAdmin(user.email))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { key, value } = await req.json();
    if (!key) {
      return NextResponse.json({ error: 'key required' }, { status: 400 });
    }

    const admin = getAdminSupabase();
    const { error } = await admin
      .from('app_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }, { onConflict: 'key' });

    if (error) {
      console.error('Settings update error:', error);
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

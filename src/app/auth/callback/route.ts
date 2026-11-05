import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { safeRedirectPath } from '@/lib/security';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Only same-origin relative paths ("/foo"); rejects "//evil", "@evil", absolute URLs.
  const next = safeRedirectPath(searchParams.get('next'), '/account');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL('/auth?error=auth_failed', origin));
}

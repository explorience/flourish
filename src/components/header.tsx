'use client';

import { useState, useEffect } from 'react';
import { CreatePostForm } from './create-post-form';
import { Search, Map, User } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function Header() {
  const [showCreate, setShowCreate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-xl mx-auto px-5 h-13 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--heading)', fontFamily: 'var(--font-display)' }}
          >
            Flourish
          </Link>

          <div className="flex items-center gap-1">
            <Link href="/search" className="p-2 rounded transition-colors" style={{ color: 'var(--sub)' }}>
              <Search className="w-4 h-4" />
            </Link>
            <Link href="/map" className="p-2 rounded transition-colors" style={{ color: 'var(--sub)' }}>
              <Map className="w-4 h-4" />
            </Link>
            <Link href={isLoggedIn ? '/account' : '/auth'} className="p-2 rounded transition-colors" style={{ color: isLoggedIn ? 'var(--offer)' : 'var(--sub)' }}>
              <User className="w-4 h-4" />
            </Link>
            <button
              onClick={() => isLoggedIn ? setShowCreate(true) : window.location.href = '/auth?next=/'}
              className="ml-1 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
              style={{
                background: 'var(--card)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-display)',
              }}
            >
              Post
            </button>
          </div>
        </div>
      </header>

      {showCreate && <CreatePostForm onClose={() => setShowCreate(false)} />}
    </>
  );
}

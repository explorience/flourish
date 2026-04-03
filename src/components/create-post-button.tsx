'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CreatePostForm } from './create-post-form';

export function CreatePostButton() {
  const [showForm, setShowForm] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleClick = () => {
    if (loggedIn === false) {
      router.push('/auth?next=/');
    } else {
      setShowForm(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors"
        style={{
          background: 'var(--card)',
          color: 'var(--ink)',
          fontFamily: 'var(--font-display)',
        }}
      >
        Offer something
      </button>
      {showForm && <CreatePostForm onClose={() => setShowForm(false)} />}
    </>
  );
}

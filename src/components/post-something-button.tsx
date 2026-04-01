'use client';

import { useState, useEffect } from 'react';
import { CreatePostForm } from './create-post-form';
import { createClient } from '@/lib/supabase/client';

export function PostSomethingButton() {
  const [showCreate, setShowCreate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  return (
    <>
      <button
        onClick={() => isLoggedIn ? setShowCreate(true) : window.location.href = '/auth?next=/'}
        className="post-btn px-8 py-3 text-sm font-bold uppercase tracking-wider transition-colors"
      >
        Post something
      </button>
      {showCreate && <CreatePostForm onClose={() => setShowCreate(false)} />}
    </>
  );
}

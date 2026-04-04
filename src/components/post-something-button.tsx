'use client';

import { useState, useEffect } from 'react';
import { CreatePostForm } from './create-post-form';
import { createClient } from '@/lib/supabase/client';

export function PostSomethingButton() {
  const [showCreate, setShowCreate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const handleClick = () => {
    if (isLoggedIn === null) return; // Still loading, do nothing
    if (isLoggedIn) {
      setShowCreate(true);
    } else {
      window.location.href = '/auth?next=/';
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="post-btn px-8 py-3 text-sm font-bold uppercase tracking-wider transition-colors"
        style={{ opacity: isLoggedIn === null ? 0.7 : 1 }}
      >
        Post something
      </button>
      {showCreate && <CreatePostForm onClose={() => setShowCreate(false)} />}
    </>
  );
}

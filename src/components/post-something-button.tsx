'use client';

import { useState, useEffect } from 'react';
import { CreatePostForm } from './create-post-form';
import { createClient } from '@/lib/supabase/client';
import { Shield } from 'lucide-react';

export function PostSomethingButton() {
  const [showCreate, setShowCreate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vouchStatus, setVouchStatus] = useState<string>('unvouched');
  const [showVouchMsg, setShowVouchMsg] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (user) {
        supabase.from('profiles').select('vouch_status').eq('id', user.id).single()
          .then(({ data }) => {
            if (data?.vouch_status) setVouchStatus(data.vouch_status);
          });
      }
    });
  }, []);

  const handleClick = () => {
    if (!isLoggedIn) {
      window.location.href = '/auth?next=/';
      return;
    }
    if (vouchStatus === 'unvouched') {
      setShowVouchMsg(true);
      setTimeout(() => setShowVouchMsg(false), 4000);
      return;
    }
    setShowCreate(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="post-btn px-8 py-3 text-sm font-bold uppercase tracking-wider transition-colors"
      >
        Post something
      </button>
      {showVouchMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowVouchMsg(false)}>
          <div className="fixed inset-0 bg-black/50" />
          <div className="relative z-10 max-w-sm w-full p-6 text-center" style={{ background: 'var(--card)' }}>
            <Shield className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--offer)' }} />
            <h3 className="text-sm font-bold uppercase tracking-wide mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Vouch needed
            </h3>
            <p className="text-sm mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-light)' }}>
              Ask an existing member to vouch for you, or use an invite link to join the community.
            </p>
            <a href="/join" className="inline-block px-6 py-2 text-xs font-bold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-display)', background: 'var(--offer)', color: 'var(--card)' }}>
              I have an invite
            </a>
          </div>
        </div>
      )}
      {showCreate && <CreatePostForm onClose={() => setShowCreate(false)} />}
    </>
  );
}

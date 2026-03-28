'use client';

import { useState, useEffect } from 'react';
import { CreatePostForm } from './create-post-form';
import { Search, Map, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function Header() {
  const [showCreate, setShowCreate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      setUserId(user?.id || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
      setUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch + subscribe to unread count when logged in
  useEffect(() => {
    if (!userId) { setUnread(0); return; }
    const supabase = createClient();

    const fetchUnread = async () => {
      // Get thread IDs the user is in
      const { data: threads } = await supabase
        .from('threads')
        .select('id')
        .or(`poster_id.eq.${userId},responder_id.eq.${userId}`);

      if (!threads?.length) { setUnread(0); return; }
      const threadIds = threads.map(t => t.id);

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('thread_id', threadIds)
        .eq('read', false)
        .neq('sender_id', userId);

      setUnread(count || 0);
    };

    fetchUnread();

    // Subscribe to new messages
    const channel = supabase
      .channel('header-unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchUnread)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, fetchUnread)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return (
    <>
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}
      >
        <div className="w-full px-5 flex items-center justify-between" style={{ height: '52px' }}>
          <Link
            href="/"
            className="text-xs md:text-xl font-bold uppercase tracking-widest"
            style={{ color: 'var(--heading)', fontFamily: 'var(--font-display)' }}
          >
            Flourish
          </Link>

          <div className="flex items-center gap-1 md:gap-3">
            {/* Text nav links — desktop only */}
            <Link
              href="/about"
              className="hidden md:inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider transition-colors"
              style={{ color: 'var(--sub)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}
            >
              About
            </Link>
            <Link
              href="/feedback"
              className="hidden md:inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider transition-colors"
              style={{ color: 'var(--sub)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}
            >
              Feedback
            </Link>
            <Link href="/search" className="p-2 md:p-3 rounded transition-colors" style={{ color: 'var(--sub)' }}>
              <Search className="w-4 h-4 md:w-7 md:h-7" />
            </Link>
            <Link href="/map" className="p-2 md:p-3 rounded transition-colors" style={{ color: 'var(--sub)' }}>
              <Map className="w-4 h-4 md:w-7 md:h-7" />
            </Link>
            {isLoggedIn && (
              <Link href="/messages" className="relative p-2 md:p-3 rounded transition-colors" style={{ color: unread > 0 ? 'var(--offer)' : 'var(--sub)' }}>
                <MessageSquare className="w-4 h-4 md:w-7 md:h-7" />
                {unread > 0 && (
                  <span
                    className="absolute top-1 right-1 md:top-1.5 md:right-1.5 flex items-center justify-center text-white font-bold"
                    style={{
                      background: 'var(--need)',
                      borderRadius: '999px',
                      fontSize: '0.5rem',
                      minWidth: '14px',
                      height: '14px',
                      padding: '0 3px',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
            )}
            <Link href={isLoggedIn ? '/account' : '/auth'} className="p-2 md:p-3 rounded transition-colors" style={{ color: isLoggedIn ? 'var(--offer)' : 'var(--sub)' }}>
              <User className="w-4 h-4 md:w-7 md:h-7" />
            </Link>
            <button
              onClick={() => isLoggedIn ? setShowCreate(true) : window.location.href = '/auth?next=/'}
              className="ml-1 px-4 py-2 md:ml-2 md:px-7 md:py-3 text-xs md:text-base font-bold uppercase tracking-wider transition-colors"
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

      {/* Mobile nav strip — about + feedback links */}
      <div
        className="flex md:hidden items-center justify-center gap-4 py-1.5 border-b text-center"
        style={{ background: 'rgba(26,42,32,0.95)', borderColor: 'var(--border)' }}
      >
        <Link
          href="/about"
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: 'var(--sub)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}
        >
          About
        </Link>
        <span style={{ color: 'var(--border)' }}>|</span>
        <Link
          href="/feedback"
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: 'var(--sub)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}
        >
          Feedback
        </Link>
      </div>

      {showCreate && <CreatePostForm onClose={() => setShowCreate(false)} />}
    </>
  );
}

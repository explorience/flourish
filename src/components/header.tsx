'use client';

import { useState, useEffect } from 'react';
import { CreatePostForm } from './create-post-form';
import { ThemeToggle } from './theme-toggle';
import { Search, Map, User, MessageSquare, Shield } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function Header() {
  const [showCreate, setShowCreate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      setUserId(user?.id || null);
      if (user?.email) {
        supabase.from('moderators').select('role').eq('email', user.email).single()
          .then(({ data }) => { if (data) setIsAdmin(true); });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
      setUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) { setUnread(0); return; }
    const supabase = createClient();

    const fetchUnread = async () => {
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

    const channel = supabase
      .channel('header-unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchUnread)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, fetchUnread)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return (
    <>
      <header className="site-header sticky top-0 z-40 backdrop-blur-xl border-b">
        <div className="site-header-inner w-full px-5 flex items-center justify-between">
          <Link href="/" className="site-logo text-xs md:text-xl font-bold uppercase tracking-widest">
            Flourish
          </Link>

          <div className="flex items-center gap-1 md:gap-3">
            <Link href="/about" className="nav-link hidden md:inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider transition-all hover:opacity-100">
              About
            </Link>
            <Link href="/feedback" className="nav-link hidden md:inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider transition-all hover:opacity-100">
              Feedback
            </Link>
            <Link href="/search" className="nav-icon p-2 md:p-3 rounded transition-all hover:opacity-100 hover:scale-110">
              <Search className="w-4 h-4 md:w-7 md:h-7" />
            </Link>
            <Link href="/map" className="nav-icon p-2 md:p-3 rounded transition-all hover:opacity-100 hover:scale-110">
              <Map className="w-4 h-4 md:w-7 md:h-7" />
            </Link>
            {isLoggedIn && (
              <Link href="/messages" className={`relative p-2 md:p-3 rounded transition-all hover:opacity-100 hover:scale-110 ${unread > 0 ? 'nav-icon-active' : 'nav-icon'}`}>
                <MessageSquare className="w-4 h-4 md:w-7 md:h-7" />
                {unread > 0 && (
                  <span className="nav-badge absolute top-1 right-1 md:top-1.5 md:right-1.5 flex items-center justify-center text-white font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="nav-icon p-2 md:p-3 rounded transition-all hover:opacity-100 hover:scale-110 hover:opacity-100 hover:scale-110" title="Admin">
                <Shield className="w-4 h-4 md:w-7 md:h-7" />
              </Link>
            )}
            <Link href={isLoggedIn ? '/account' : '/auth'} className={`p-2 md:p-3 rounded transition-colors hover:opacity-100 hover:scale-110 ${isLoggedIn ? 'nav-icon-active' : 'nav-icon'}`}>
              <User className="w-4 h-4 md:w-7 md:h-7" />
            </Link>
            <ThemeToggle />
            <button
              onClick={() => {
                if (isLoggedIn === null) return;
                isLoggedIn ? setShowCreate(true) : window.location.href = '/auth?next=/';
              }}
              className="post-btn ml-1 px-4 py-2 md:ml-2 md:px-7 md:py-3 text-xs md:text-base font-bold uppercase tracking-wider transition-all hover:scale-105 hover:brightness-110"
            >
              Post
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-nav flex md:hidden items-center justify-center gap-4 py-1.5 border-b text-center">
        <Link href="/about" className="nav-link text-xs font-bold uppercase tracking-wider">
          About
        </Link>
        <span className="mobile-nav-sep">|</span>
        <Link href="/feedback" className="nav-link text-xs font-bold uppercase tracking-wider">
          Feedback
        </Link>
      </div>

      {showCreate && <CreatePostForm onClose={() => setShowCreate(false)} />}
    </>
  );
}

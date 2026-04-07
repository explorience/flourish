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

          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button
              onClick={() => {
                const menu = document.getElementById('nav-menu');
                if (menu) menu.classList.toggle('hidden');
              }}
              className="flex items-center justify-center p-2 md:p-3 rounded transition-all hover:opacity-100 hover:scale-110"
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div id="nav-menu" className="nav-menu hidden fixed top-[3.25rem] right-4 bg-card border border-border-card rounded-sm shadow-lg z-50 min-w-48">
              <div className="py-2">
                <Link href="/about" className="block px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-bg-light transition-colors">
                  About
                </Link>
                <Link href="/feedback" className="block px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-bg-light transition-colors">
                  Feedback
                </Link>
                <Link href="/guide" className="block px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-bg-light transition-colors">
                  Using Flourish
                </Link>
                <Link href="/code-of-conduct" className="block px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-bg-light transition-colors">
                  Code of Conduct
                </Link>
              </div>
            </div>
            {isLoggedIn && (
              <Link href="/messages" className={`relative p-2 md:p-3 rounded transition-all hover:opacity-100 hover:scale-110 ${unread > 0 ? 'nav-icon-active' : 'nav-icon'}`} aria-label={`Messages${unread > 0 ? ` (${unread} unread)` : ''}`}>
                <MessageSquare className="w-4 h-4 md:w-7 md:h-7" aria-hidden="true" />
                {unread > 0 && (
                  <span className="nav-badge absolute top-1 right-1 md:top-1.5 md:right-1.5 flex items-center justify-center text-white font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
            )}
                <MessageSquare className="w-4 h-4 md:w-7 md:h-7" aria-hidden="true" />
                {unread > 0 && (
                  <span className="nav-badge absolute top-1 right-1 md:top-1.5 md:right-1.5 flex items-center justify-center text-white font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="nav-icon p-2 md:p-3 rounded transition-all hover:opacity-100 hover:scale-110" title="Admin" aria-label="Admin dashboard">
                <Shield className="w-4 h-4 md:w-7 md:h-7" aria-hidden="true" />
              </Link>
            )}
            {isLoggedIn && (
              <Link href="/account" className="p-2 md:p-3 rounded transition-colors hover:opacity-100 hover:scale-110 nav-icon-active" aria-label="Your account">
                <User className="w-4 h-4 md:w-7 md:h-7" aria-hidden="true" />
              </Link>
            )}
            <ThemeToggle />
            {isLoggedIn && (
              <button
                onClick={() => setShowCreate(true)}
                className="post-btn ml-1 px-3 py-2 md:ml-2 md:px-5 md:py-2 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 hover:brightness-110"
              >
                Post
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mobile-nav-spacer h-1" />

      <style jsx>{`
        .nav-menu.hidden {
          display: none;
        }
        .mobile-nav-spacer {
          height: 0.0625rem;
        }
      `}</style>

      {showCreate && <CreatePostForm onClose={() => setShowCreate(false)} />}
    </>
  );
}

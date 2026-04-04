'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, Trash2, LogOut, MessageCircle, MessageSquare, UserCircle, Bell, BellOff } from 'lucide-react';
import { PushManager } from '@/components/push-manager';
import type { PostWithResponses } from '@/types/database';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useEffect } from 'react';

export function AccountClient({ user, posts }: { user: User; posts: PostWithResponses[] }) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [emailToggling, setEmailToggling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.from('profiles').select('email_notifications').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) setEmailNotifications(data.email_notifications ?? true);
      });
  }, [user.id]);

  const toggleEmailNotifications = async () => {
    setEmailToggling(true);
    const supabase = createClient();
    const newVal = !emailNotifications;
    await supabase.from('profiles').upsert({
      id: user.id,
      email_notifications: newVal,
      display_name: user.email?.split('@')[0] || '',
    }, { onConflict: 'id' });
    setEmailNotifications(newVal);
    setEmailToggling(false);
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const updateStatus = async (postId: string, status: 'fulfilled' | 'expired' | 'active') => {
    setUpdating(postId);
    const supabase = createClient();
    await supabase.from('posts').update({ status }).eq('id', postId);
    router.refresh();
    setUpdating(null);
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    setUpdating(postId);
    const supabase = createClient();
    // Delete responses first, then the post
    await supabase.from('responses').delete().eq('post_id', postId);
    await supabase.from('posts').delete().eq('id', postId);
    router.refresh();
    setUpdating(null);
  };

  const activeCount = posts.filter(p => p.status === 'active').length;
  const fulfilledCount = posts.filter(p => p.status === 'fulfilled').length;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Active', value: activeCount },
          { label: 'Fulfilled', value: fulfilledCount },
          { label: 'Responses', value: posts.reduce((a, p) => a + p.responses.length, 0) },
        ].map((s) => (
          <div key={s.label} className="text-center py-4 card-theme">
            <p className="text-2xl font-bold font-display color-ink">{s.value}</p>
            <p className="text-xs uppercase tracking-wide font-display color-ink-muted" style={{ fontSize: '0.58rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base italic mb-4 font-serif color-sub">You haven&apos;t posted anything yet.</p>
          <Link href="/" className="text-xs font-bold uppercase tracking-wider px-6 py-3 transition-all font-display"
            style={{ background: 'var(--card)', color: 'var(--ink)' }}>
            Go to the board
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="p-4 card-theme">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider mr-2 font-display"
                    style={{ color: post.type === 'need' ? 'var(--need)' : 'var(--offer)', fontSize: '0.6rem' }}>
                    {post.type}
                  </span>
                  <span className="inline-block text-xs px-1.5 py-0.5 uppercase tracking-wider font-display"
                    style={{ fontSize: '0.55rem', background: post.status === 'active' ? 'rgba(58,106,74,0.15)' : 'rgba(122,138,120,0.15)', color: post.status === 'active' ? 'var(--offer)' : 'var(--ink-muted)' }}>
                    {post.status}
                  </span>
                </div>
                <span className="text-xs flex-shrink-0 color-ink-muted">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>

              <Link href={`/post/${post.id}`}>
                <h3 className="text-base mb-1 hover:underline font-serif color-ink" style={{ fontWeight: 400 }}>
                  {post.title}
                </h3>
              </Link>

              {post.responses.length > 0 && (
                <div className="flex items-center gap-1 text-xs mb-3 color-offer">
                  <MessageCircle className="w-3 h-3" />
                  <span>{post.responses.length} {post.responses.length === 1 ? 'response' : 'responses'}</span>
                </div>
              )}

              {post.status === 'active' && (
                <div className="flex gap-2 pt-3" style={{ borderTop: '1px dashed var(--border-card)' }}>
                  <button onClick={() => updateStatus(post.id, 'fulfilled')} disabled={updating === post.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-all font-display"
                    style={{ border: '1.5px solid var(--offer)', color: 'var(--offer)', background: 'transparent', fontSize: '0.6rem' }}>
                    <CheckCircle className="w-3 h-3" /> Fulfilled
                  </button>
                  <button onClick={() => updateStatus(post.id, 'expired')} disabled={updating === post.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-all font-display"
                    style={{ border: '1.5px solid var(--border-card)', color: 'var(--ink-muted)', background: 'transparent', fontSize: '0.6rem' }}>
                    <XCircle className="w-3 h-3" /> Close
                  </button>
                  <button onClick={() => deletePost(post.id)} disabled={updating === post.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-all font-display"
                    style={{ border: '1.5px solid rgba(208,112,64,0.3)', color: 'var(--need)', background: 'transparent', fontSize: '0.6rem' }}>
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
              {post.status !== 'active' && (
                <div className="flex gap-2 pt-3" style={{ borderTop: '1px dashed var(--border-card)' }}>
                  <button onClick={() => deletePost(post.id)} disabled={updating === post.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-all font-display"
                    style={{ border: '1.5px solid rgba(208,112,64,0.3)', color: 'var(--need)', background: 'transparent', fontSize: '0.6rem' }}>
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Profile & Messages */}
      <div className="mt-8 pt-6 space-y-3 border-t-theme">
        <Link href="/account/profile" className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all w-full font-display card-theme color-ink">
          <UserCircle className="w-4 h-4" /> Edit Profile
        </Link>
        <Link href="/messages" className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all w-full font-display card-theme color-ink">
          <MessageSquare className="w-4 h-4" /> My Messages
        </Link>
      </div>

      {/* Email notifications toggle */}
      <div className="mt-4 pt-4 border-t-theme">
        <button
          onClick={toggleEmailNotifications}
          disabled={emailToggling}
          className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all w-full disabled:opacity-40 font-display color-ink"
          style={{ background: emailNotifications ? 'rgba(58,106,74,0.1)' : 'var(--card)', border: `1px solid ${emailNotifications ? 'var(--offer)' : 'var(--border-card)'}` }}
        >
          {emailNotifications ? <Bell className="w-4 h-4 color-offer" /> : <BellOff className="w-4 h-4" />}
          Email notifications {emailNotifications ? 'on' : 'off'}
        </button>
        <PushManager />
      </div>

      {/* Sign out */}
      <div className="mt-4 pt-4 border-t-theme">
        <button onClick={signOut} className="inline-flex items-center gap-2 text-xs transition-colors color-ink-muted">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth?next=/messages');

  const admin = getAdmin();

  const { data: threads } = await admin
    .from('threads')
    .select('*, posts(id, title, type)')
    .or(`poster_id.eq.${user.id},responder_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false });

  // For each thread, get last message + unread count + other user's name
  const enriched = await Promise.all((threads || []).map(async (thread) => {
    const otherId = thread.poster_id === user.id ? thread.responder_id : thread.poster_id;

    const [{ data: lastMsg }, { count: unread }, { data: otherUser }] = await Promise.all([
      admin.from('messages').select('content, sender_id, created_at').eq('thread_id', thread.id).order('created_at', { ascending: false }).limit(1).single(),
      admin.from('messages').select('*', { count: 'exact', head: true }).eq('thread_id', thread.id).eq('read', false).neq('sender_id', user.id),
      admin.auth.admin.getUserById(otherId),
    ]);

    const otherName = otherUser?.user?.user_metadata?.name || otherUser?.user?.email?.split('@')[0] || 'Neighbour';

    return { ...thread, lastMsg, unread: unread || 0, otherName };
  }));

  const ds = { fontFamily: 'var(--font-display)' } as React.CSSProperties;
  const sr = { fontFamily: 'var(--font-serif)' } as React.CSSProperties;

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto px-5 flex items-center justify-between" style={{ height: '156px' }}>
          <Link href="/" className="inline-flex items-center gap-2 text-xs" style={{ color: 'var(--sub)' }}>
            <ArrowLeft className="w-4 h-4" /> Board
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ ...ds, color: 'var(--heading)' }}>Messages</span>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-8">
        {enriched.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--border)' }} />
            <p className="text-lg italic mb-2" style={{ ...sr, color: 'var(--sub)' }}>No conversations yet</p>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              When someone responds to your post, you can start a private conversation here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {enriched.map((thread) => {
              const post = thread.posts as any;
              const isNeed = post?.type === 'need';
              const lastMsgPreview = thread.lastMsg?.content
                ? thread.lastMsg.content.length > 60
                  ? thread.lastMsg.content.slice(0, 60) + '…'
                  : thread.lastMsg.content
                : 'No messages yet';
              const isMine = thread.lastMsg?.sender_id === user.id;

              return (
                <Link key={thread.id} href={`/messages/${thread.id}`}>
                  <div
                    className="flex items-start gap-4 p-4 transition-all hover:translate-x-0.5"
                    style={{
                      background: 'var(--card)',
                      border: `1px solid ${thread.unread > 0 ? 'var(--offer)' : 'var(--border)'}`,
                    }}
                  >
                    {/* Unread dot */}
                    <div className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full" style={{
                      background: thread.unread > 0 ? 'var(--offer)' : 'transparent',
                    }} />

                    <div className="flex-1 min-w-0">
                      {/* Post context */}
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ ...ds, fontSize: '0.58rem', color: isNeed ? 'var(--need)' : 'var(--offer)' }}>
                          {post?.type}
                        </span>
                        <span className="text-xs font-medium truncate" style={{ color: 'var(--ink)' }}>{post?.title}</span>
                      </div>

                      {/* Other party */}
                      <p className="text-xs font-bold mb-1" style={{ ...ds, color: 'var(--ink-light)', fontSize: '0.68rem' }}>
                        {thread.otherName}
                      </p>

                      {/* Last message preview */}
                      <p className="text-xs truncate" style={{ color: thread.unread > 0 ? 'var(--ink)' : 'var(--ink-muted)' }}>
                        {isMine && <span style={{ color: 'var(--ink-muted)' }}>You: </span>}
                        {lastMsgPreview}
                      </p>
                    </div>

                    {/* Time */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs" style={{ color: 'var(--ink-muted)', fontSize: '0.65rem' }}>
                        {thread.lastMsg ? formatDistanceToNow(new Date(thread.lastMsg.created_at), { addSuffix: false }) : ''}
                      </p>
                      {thread.unread > 0 && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-xs font-bold" style={{ ...ds, fontSize: '0.55rem', background: 'var(--offer)', color: '#fff' }}>
                          {thread.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

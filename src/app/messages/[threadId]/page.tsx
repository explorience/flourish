import { createClient } from '@/lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MessageThread } from './message-thread';

export const revalidate = 0;

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function ThreadPage({ params }: { params: { threadId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth?next=/messages/${params.threadId}`);

  const admin = getAdmin();

  const { data: thread } = await admin
    .from('threads')
    .select('*, posts(id, title, type, status)')
    .eq('id', params.threadId)
    .single();

  if (!thread) notFound();
  if (thread.poster_id !== user.id && thread.responder_id !== user.id) redirect('/messages');

  // Fetch messages
  const { data: messages } = await admin
    .from('messages')
    .select('*')
    .eq('thread_id', params.threadId)
    .order('created_at', { ascending: true });

  // Mark unread messages as read (messages sent by the other party)
  const unreadIds = (messages || [])
    .filter(m => m.sender_id !== user.id && !m.read)
    .map(m => m.id);
  if (unreadIds.length > 0) {
    await admin.from('messages').update({ read: true }).in('id', unreadIds);
  }

  // Get other participant's name
  const otherId = thread.poster_id === user.id ? thread.responder_id : thread.poster_id;
  const { data: otherUser } = await admin.auth.admin.getUserById(otherId);
  const otherName = otherUser?.user?.user_metadata?.name || otherUser?.user?.email?.split('@')[0] || 'Neighbour';

  const post = thread.posts as any;

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b flex-shrink-0" style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link href="/messages" className="text-xs flex items-center gap-1.5 flex-shrink-0" style={{ color: 'var(--sub)' }}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--heading)' }}>
              {otherName}
            </p>
            <Link href={`/post/${post?.id}`} className="text-xs truncate hover:underline block" style={{ color: 'var(--sub)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              <span style={{ color: post?.type === 'need' ? 'var(--need)' : 'var(--offer)', fontStyle: 'normal', fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {post?.type}
              </span>
              {' '}{post?.title}
            </Link>
          </div>
        </div>
      </header>

      {/* Messages + Send box */}
      <MessageThread
        threadId={params.threadId}
        currentUserId={user.id}
        initialMessages={messages || []}
        otherName={otherName}
      />
    </main>
  );
}

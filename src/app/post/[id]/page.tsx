import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import { CATEGORIES, URGENCIES } from '@/lib/constants';
import { PostDetailClient } from './post-detail-client';
import { ArrowLeft, Clock, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { getModeratorByEmail } from '@/lib/admin';

export default async function PostDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: post } = await supabase.from('posts').select('*, responses(*)').eq('id', params.id).single();

  // Check moderation status for the current user
  const { data: { user } } = await supabase.auth.getUser();
  const isModerator = user?.email ? !!(await getModeratorByEmail(user.email)) : false;
  if (!post) notFound();

  const categoryInfo = CATEGORIES.find((c) => c.value === post.category);
  const urgencyInfo = URGENCIES.find((u) => u.value === post.urgency);
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const dateStr = format(new Date(post.created_at), 'MMMM d, yyyy');
  const isNeed = post.type === 'need';

  // Show "edited" when updated_at is more than 1 minute after created_at
  const createdMs = new Date(post.created_at).getTime();
  const updatedMs = new Date(post.updated_at).getTime();
  const wasEdited = updatedMs - createdMs > 60_000;
  const editedAgo = wasEdited
    ? formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })
    : null;

  return (
    <main className="min-h-screen" style={{
      background: 'var(--bg)',
      backgroundImage: isNeed
        ? 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(208,112,64,0.12) 0%, transparent 70%)'
        : 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(58,106,74,0.18) 0%, transparent 70%)',
    }}>
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}>
        <div className="max-w-xl mx-auto px-5 flex items-center" style={{ height: "156px" }}>
          <Link href="/" className="inline-flex items-center gap-2 text-xs color-sub">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-5 py-8">
        {/* Status */}
        {post.status === 'fulfilled' && (
          <div className="mb-6 p-4 text-center text-sm" style={{ background: 'rgba(58,106,74,0.15)', color: 'var(--offer)' }}>Fulfilled ✓</div>
        )}
        {post.status === 'expired' && (
          <div className="mb-6 p-4 text-center text-sm" style={{ background: 'rgba(122,138,120,0.15)', color: 'var(--ink-muted)' }}>Expired</div>
        )}

        {/* Type */}
        <div className="text-xs font-bold uppercase tracking-wider mb-3 font-display" style={{ color: isNeed ? 'var(--need)' : 'var(--offer)', fontSize: '0.65rem', letterSpacing: '0.15em' }}>
          {isNeed ? 'Need' : 'Offer'}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl leading-tight mb-4 font-serif color-heading" style={{ fontWeight: 400 }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 text-xs mb-6 color-sub" style={{ fontSize: '0.72rem' }}>
          <span style={{ fontWeight: 500, color: 'var(--heading)' }}>{(post as any).profiles?.display_name || post.contact_name}</span>
          {(post as any).profiles?.neighbourhood && (
            <>
              <span>&mdash;</span>
              <span className="font-display color-offer" style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {(post as any).profiles.neighbourhood}
              </span>
            </>
          )}
          <span>&mdash;</span>
          <span title={dateStr}>{timeAgo}</span>
          {editedAgo && (
            <span style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              · edited {editedAgo}
            </span>
          )}
          {categoryInfo && <><span>&mdash;</span><span>{categoryInfo.label}</span></>}
          {post.urgency !== 'flexible' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5" style={{ background: post.urgency === 'today' ? 'rgba(208,112,64,0.15)' : 'rgba(224,216,192,0.15)', color: post.urgency === 'today' ? 'var(--need)' : 'var(--heading)' }}>
              <Clock className="w-3 h-3" />{urgencyInfo?.label}
            </span>
          )}
          {post.source === 'sms' && <span className="px-1.5 py-0.5 uppercase tracking-wider" style={{ fontSize: '0.55rem', background: 'rgba(58,106,74,0.15)', color: 'var(--offer)' }}>via sms</span>}
        </div>

        {/* Details */}
        {post.details && (
          <div className="mb-8">
            <p className="text-sm leading-relaxed whitespace-pre-wrap color-heading">{post.details}</p>
          </div>
        )}

        {/* Contact info (if public method chosen) */}
        {post.contact_method !== 'app' && post.contact_value && (
          <div className="mb-8 p-4" style={{ background: 'rgba(240,236,224,0.08)', border: '1px dashed var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2 font-display color-sub" style={{ fontSize: '0.6rem' }}>Contact</p>
            <div className="flex items-center gap-2 text-sm color-heading">
              {post.contact_method === 'phone' ? <><Phone className="w-4 h-4 color-sub" /><a href={`tel:${post.contact_value}`}>{post.contact_value}</a></> : <><Mail className="w-4 h-4 color-sub" /><a href={`mailto:${post.contact_value}`}>{post.contact_value}</a></>}
            </div>
          </div>
        )}

        <PostDetailClient post={post} isModerator={isModerator} />
      </div>
    </main>
  );
}

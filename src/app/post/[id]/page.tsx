import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import { CATEGORIES, URGENCIES } from '@/lib/constants';
import { PostDetailClient } from './post-detail-client';
import { ArrowLeft, Clock, Package, HandHelping, Lightbulb, Home, Sparkles, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  items: <Package className="w-4 h-4" />,
  services: <HandHelping className="w-4 h-4" />,
  skills: <Lightbulb className="w-4 h-4" />,
  space: <Home className="w-4 h-4" />,
  other: <Sparkles className="w-4 h-4" />,
};

export default async function PostDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: post } = await supabase
    .from('posts')
    .select('*, responses(*)')
    .eq('id', params.id)
    .single();

  if (!post) notFound();

  const categoryInfo = CATEGORIES.find((c) => c.value === post.category);
  const urgencyInfo = URGENCIES.find((u) => u.value === post.urgency);
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const dateStr = format(new Date(post.created_at), 'MMMM d, yyyy');
  const isNeed = post.type === 'need';
  const isFulfilled = post.status === 'fulfilled';
  const isExpired = post.status === 'expired';

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[hsl(39,50%,96%)]/80 border-b border-[hsl(35,25%,87%)]">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[hsl(25,15%,45%)] hover:text-[hsl(25,30%,25%)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Status banners */}
        {isFulfilled && (
          <div className="mb-6 p-4 rounded-2xl bg-[hsl(145,30%,94%)] border border-[hsl(145,25%,85%)] text-center">
            <p className="text-sm font-medium text-[hsl(145,35%,30%)]">This has been fulfilled</p>
          </div>
        )}
        {isExpired && (
          <div className="mb-6 p-4 rounded-2xl bg-[hsl(35,20%,92%)] border border-[hsl(35,15%,85%)] text-center">
            <p className="text-sm font-medium text-[hsl(25,15%,45%)]">This post has expired</p>
          </div>
        )}

        {/* Type badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
            isNeed 
              ? 'bg-[hsl(18,50%,95%)] text-[hsl(18,60%,42%)]' 
              : 'bg-[hsl(145,30%,94%)] text-[hsl(145,35%,32%)]'
          }`}>
            {isNeed ? 'Looking for' : 'Offering'}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-semibold text-[hsl(25,30%,18%)] leading-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-[hsl(25,12%,55%)] mb-6">
          <span className="font-medium text-[hsl(25,20%,35%)]">{post.contact_name}</span>
          <span className="text-[hsl(25,10%,82%)]">/</span>
          <span title={dateStr}>{timeAgo}</span>
          
          <span className="inline-flex items-center gap-1">
            {CATEGORY_ICONS[post.category]}
            {categoryInfo?.label}
          </span>

          {post.urgency !== 'flexible' && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
              post.urgency === 'today' 
                ? 'bg-[hsl(0,50%,95%)] text-[hsl(0,50%,42%)]' 
                : 'bg-[hsl(40,50%,93%)] text-[hsl(35,50%,35%)]'
            }`}>
              <Clock className="w-3 h-3" />
              {urgencyInfo?.label}
            </span>
          )}

          {post.source === 'sms' && (
            <span className="px-1.5 py-0.5 rounded bg-[hsl(210,40%,95%)] text-[hsl(210,40%,45%)] text-[10px] font-medium uppercase tracking-wider">
              via sms
            </span>
          )}
        </div>

        {/* Details */}
        {post.details && (
          <div className="mb-8">
            <p className="text-[hsl(25,15%,35%)] text-base leading-relaxed whitespace-pre-wrap">
              {post.details}
            </p>
          </div>
        )}

        {/* Contact info */}
        {post.contact_method !== 'app' && post.contact_value && (
          <div className="mb-8 p-4 rounded-2xl bg-[hsl(35,30%,95%)] border border-[hsl(35,20%,88%)]">
            <p className="text-xs text-[hsl(25,15%,55%)] uppercase tracking-wider font-medium mb-2">Contact</p>
            <div className="flex items-center gap-2 text-sm text-[hsl(25,30%,25%)]">
              {post.contact_method === 'phone' ? (
                <>
                  <Phone className="w-4 h-4 text-[hsl(25,15%,50%)]" />
                  <a href={`tel:${post.contact_value}`} className="warm-link font-medium">{post.contact_value}</a>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-[hsl(25,15%,50%)]" />
                  <a href={`mailto:${post.contact_value}`} className="warm-link font-medium">{post.contact_value}</a>
                </>
              )}
            </div>
          </div>
        )}

        {/* Respond + Fulfil */}
        <PostDetailClient post={post} />

        {/* Responses */}
        {post.responses && post.responses.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-[hsl(25,30%,20%)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Responses ({post.responses.length})
            </h2>
            <div className="space-y-3 stagger-children">
              {post.responses.map((response: any) => (
                <div key={response.id} className="p-4 rounded-2xl bg-white border border-[hsl(35,20%,89%)]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-[hsl(25,25%,25%)]">{response.responder_name}</span>
                    <span className="text-xs text-[hsl(25,12%,60%)]">
                      {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {response.message && (
                    <p className="text-sm text-[hsl(25,15%,40%)]">{response.message}</p>
                  )}
                  {response.responder_contact && (
                    <p className="text-xs text-[hsl(25,12%,55%)] mt-2">{response.responder_contact}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

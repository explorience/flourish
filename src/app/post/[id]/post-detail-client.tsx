'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { RespondDialog } from '@/components/respond-dialog';
import { MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import type { PostWithResponses } from '@/types/database';

export function PostDetailClient({ post }: { post: PostWithResponses }) {
  const [showRespond, setShowRespond] = useState(false);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const isNeed = post.type === 'need';
  if (post.status !== 'active') return null;

  const updateStatus = async (status: 'fulfilled' | 'expired') => {
    setUpdating(true);
    const supabase = createClient();
    await supabase.from('posts').update({ status }).eq('id', post.id);
    router.refresh();
    setUpdating(false);
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setShowRespond(true)}
          className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all"
          style={{ background: isNeed ? 'var(--need)' : 'var(--offer)', color: 'var(--card)', fontFamily: 'var(--font-display)' }}
        >
          <MessageCircle className="w-4 h-4" />{isNeed ? 'I can help' : "I'm interested"}
        </button>
        <button onClick={() => updateStatus('fulfilled')} disabled={updating}
          className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all"
          style={{ border: '1.5px solid var(--offer)', color: 'var(--offer)', background: 'transparent', fontFamily: 'var(--font-display)' }}
        >
          <CheckCircle className="w-4 h-4" />Fulfilled
        </button>
        <button onClick={() => updateStatus('expired')} disabled={updating}
          className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all"
          style={{ border: '1.5px solid var(--border)', color: 'var(--sub)', background: 'transparent', fontFamily: 'var(--font-display)' }}
        >
          <XCircle className="w-4 h-4" />Close
        </button>
      </div>
      <RespondDialog post={post} open={showRespond} onClose={() => setShowRespond(false)} />
    </>
  );
}

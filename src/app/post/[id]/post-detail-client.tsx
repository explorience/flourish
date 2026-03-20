'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { RespondDialog } from '@/components/respond-dialog';
import { MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import type { PostWithResponses } from '@/types/database';

interface PostDetailClientProps {
  post: PostWithResponses;
}

export function PostDetailClient({ post }: PostDetailClientProps) {
  const [showRespond, setShowRespond] = useState(false);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const isNeed = post.type === 'need';
  const isActive = post.status === 'active';

  const updateStatus = async (status: 'fulfilled' | 'expired') => {
    setUpdating(true);
    const supabase = createClient();
    await supabase.from('posts').update({ status }).eq('id', post.id);
    router.refresh();
    setUpdating(false);
  };

  if (!isActive) return null;

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowRespond(true)}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-white transition-all ${
            isNeed
              ? 'bg-[hsl(18,60%,52%)] hover:bg-[hsl(18,60%,46%)]'
              : 'bg-[hsl(145,30%,42%)] hover:bg-[hsl(145,30%,36%)]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          {isNeed ? 'I can help' : "I'm interested"}
        </button>

        <button
          onClick={() => updateStatus('fulfilled')}
          disabled={updating}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm border border-[hsl(145,25%,78%)] text-[hsl(145,30%,35%)] hover:bg-[hsl(145,30%,95%)] transition-all disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          Mark fulfilled
        </button>

        <button
          onClick={() => updateStatus('expired')}
          disabled={updating}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm border border-[hsl(35,20%,85%)] text-[hsl(25,15%,50%)] hover:bg-[hsl(35,20%,93%)] transition-all disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          Close
        </button>
      </div>

      <RespondDialog
        post={post}
        open={showRespond}
        onClose={() => setShowRespond(false)}
      />
    </>
  );
}

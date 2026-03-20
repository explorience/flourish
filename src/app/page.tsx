import { createClient } from '@/lib/supabase/server';
import { PostFeed } from '@/components/post-feed';
import { CreatePostButton } from '@/components/create-post-button';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import { Heart } from 'lucide-react';

export default async function Home() {
  const supabase = await createClient();
  
  const { data: posts } = await supabase
    .from('posts')
    .select('*, responses(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-amber-50">
      {/* Hero */}
      <div className="bg-gradient-to-b from-amber-100 to-amber-50 border-b border-amber-200">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-8 h-8 text-orange-500 fill-orange-500" />
            <h1 className="text-3xl font-bold text-amber-900">{APP_NAME}</h1>
          </div>
          <p className="text-lg text-amber-700 mb-6">{APP_DESCRIPTION}</p>
          <CreatePostButton />
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <PostFeed initialPosts={posts || []} />
      </div>
    </main>
  );
}

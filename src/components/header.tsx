'use client';

import { useState } from 'react';
import { CreatePostForm } from './create-post-form';
import { Search } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[hsl(39,50%,96%)]/80 border-b border-[hsl(35,25%,87%)]">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-[hsl(25,30%,25%)] tracking-tight">
            ME
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 rounded-full hover:bg-[hsl(35,30%,90%)] transition-colors text-[hsl(25,15%,45%)]"
            >
              <Search className="w-4.5 h-4.5" />
            </Link>

            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-[hsl(25,45%,30%)] text-[hsl(39,50%,96%)] hover:bg-[hsl(25,45%,25%)] transition-colors"
            >
              New post
            </button>
          </div>
        </div>
      </header>

      {showCreate && <CreatePostForm onClose={() => setShowCreate(false)} />}
    </>
  );
}

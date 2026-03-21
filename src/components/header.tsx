'use client';

import { useState } from 'react';
import { CreatePostForm } from './create-post-form';
import { Search } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-xl mx-auto px-5 h-13 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--heading)', fontFamily: 'var(--font-display)' }}
          >
            The Porch
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 rounded transition-colors"
              style={{ color: 'var(--sub)' }}
            >
              <Search className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
              style={{
                background: 'var(--card)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-display)',
              }}
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

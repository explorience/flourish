'use client';

import { useState } from 'react';
import { CreatePostForm } from './create-post-form';

export function CreatePostButton() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors"
        style={{
          background: 'var(--card)',
          color: 'var(--ink)',
          fontFamily: 'var(--font-display)',
        }}
      >
        Share something
      </button>
      {showForm && <CreatePostForm onClose={() => setShowForm(false)} />}
    </>
  );
}

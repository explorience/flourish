'use client';

import { useState } from 'react';
import { CreatePostForm } from './create-post-form';

export function CreatePostButton() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="px-6 py-3 bg-[hsl(25,45%,30%)] hover:bg-[hsl(25,45%,25%)] text-[hsl(39,50%,96%)] rounded-xl font-medium text-sm transition-colors"
      >
        Share something
      </button>

      {showForm && <CreatePostForm onClose={() => setShowForm(false)} />}
    </>
  );
}

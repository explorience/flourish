'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CreatePostForm } from './create-post-form';

export function CreatePostButton() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-amber-900/20"
      >
        <Plus className="w-5 h-5" />
        Post a Need or Offer
      </button>

      {showForm && <CreatePostForm onClose={() => setShowForm(false)} />}
    </>
  );
}

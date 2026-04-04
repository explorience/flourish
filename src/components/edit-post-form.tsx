'use client';

import { useState } from 'react';
import { CATEGORIES, URGENCIES } from '@/lib/constants';
import type { Post, Category, Urgency } from '@/types/database';
import { X } from 'lucide-react';

interface EditPostFormProps {
  post: Post;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPostForm({ post, onClose, onSuccess }: EditPostFormProps) {
  const [title, setTitle] = useState(post.title);
  const [details, setDetails] = useState(post.details || '');
  const [category, setCategory] = useState<Category>(post.category);
  const [urgency, setUrgency] = useState<Urgency>(post.urgency);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNeed = post.type === 'need';

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          details: details.trim() || null,
          category,
          urgency,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const ds = { fontFamily: 'var(--font-display)' } as React.CSSProperties;
  const sr = { fontFamily: 'var(--font-serif)' } as React.CSSProperties;
  const accentColor = isNeed ? 'var(--need)' : 'var(--offer)';

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto sm:rounded-md"
        style={{ background: 'var(--card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ ...ds, color: 'var(--sub)', fontSize: '0.6rem' }}
            >
              Edit post
            </p>
            <p
              className="text-sm font-bold uppercase tracking-wide mt-0.5"
              style={{ ...ds, color: 'var(--ink)' }}
            >
              {isNeed ? 'Edit your need' : 'Edit your offer'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2"
            style={{ color: 'var(--ink-muted)' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accent bar */}
        <div className="h-0.5 mx-6 mb-6" style={{ background: accentColor, opacity: 0.4 }} />

        <div className="px-6 pb-8 space-y-5">
          {/* Title */}
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ ...ds, color: 'var(--ink-light)', fontSize: '0.6rem' }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-0 py-3 bg-transparent border-0 border-b-2 focus:outline-none text-lg"
              style={{ borderColor: 'var(--border-card)', color: 'var(--ink)', ...sr }}
              placeholder={isNeed ? 'What do you need?' : 'What can you offer?'}
              autoFocus
            />
          </div>

          {/* Details */}
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ ...ds, color: 'var(--ink-light)', fontSize: '0.6rem' }}
            >
              Details{' '}
              <span
                className="normal-case tracking-normal font-normal"
                style={{ color: 'var(--ink-muted)' }}
              >
                (optional)
              </span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-4 py-3 text-sm focus:outline-none resize-none"
              style={{
                background: 'rgba(240,236,224,0.06)',
                border: '1px solid var(--border-card)',
                color: 'var(--ink)',
              }}
              rows={3}
              placeholder="Any extra context..."
            />
          </div>

          {/* Category */}
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ ...ds, color: 'var(--ink-light)', fontSize: '0.6rem' }}
            >
              Category
            </label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className="px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all"
                  style={{
                    ...ds,
                    fontSize: '0.6rem',
                    background: category === c.value ? 'var(--ink)' : 'transparent',
                    color: category === c.value ? 'var(--card)' : 'var(--ink-light)',
                    border: `1.5px solid ${category === c.value ? 'var(--ink)' : 'var(--border-card)'}`,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ ...ds, color: 'var(--ink-light)', fontSize: '0.6rem' }}
            >
              How soon?
            </label>
            <div className="flex gap-2">
              {URGENCIES.map((u) => (
                <button
                  key={u.value}
                  type="button"
                  onClick={() => setUrgency(u.value)}
                  className="flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wider text-center transition-all"
                  style={{
                    ...ds,
                    fontSize: '0.6rem',
                    background: urgency === u.value ? 'var(--ink)' : 'transparent',
                    color: urgency === u.value ? 'var(--card)' : 'var(--ink-light)',
                    border: `1.5px solid ${urgency === u.value ? 'var(--ink)' : 'var(--border-card)'}`,
                  }}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-xs px-3 py-2"
              style={{
                background: 'rgba(208,112,64,0.1)',
                border: '1px solid rgba(208,112,64,0.3)',
                color: 'var(--need)',
                ...ds,
                fontSize: '0.7rem',
              }}
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className="w-full py-4 text-sm font-bold uppercase tracking-wider disabled:opacity-40 transition-all"
            style={{
              background: accentColor,
              color: 'var(--card)',
              ...ds,
            }}
          >
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

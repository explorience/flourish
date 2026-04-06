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
  const [imagePreviews, setImagePreviews] = useState<string[]>((post as any).image_urls || []);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>((post as any).image_urls || []);
  const [archiving, setArchiving] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

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
          image_urls: imageUrls,
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

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/archive`, { method: 'POST' });
      if (res.ok) {
        window.location.href = '/';
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to archive');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setArchiving(false);
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

          {/* Image upload — up to 10 */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ ...ds, color: 'var(--ink-light)', fontSize: '0.6rem' }}>
              Photos <span className="normal-case tracking-normal font-normal" style={{ color: 'var(--ink-muted)' }}>(optional — up to 10)</span>
            </label>
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="" className="w-14 h-14 object-cover rounded" style={{ objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => {
                        const newUrls = imageUrls.filter((_, idx) => idx !== i);
                        const newPreviews = imagePreviews.filter((_, idx) => idx !== i);
                        setImageUrls(newUrls);
                        setImagePreviews(newPreviews);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--need)', color: 'white', fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 'bold' }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
            {imageUrls.length < 10 && (
              <label className="block w-full py-3 text-center text-xs font-bold uppercase tracking-wider cursor-pointer font-display" style={{ fontSize: '0.6rem', border: '1.5px dashed var(--border-card)', color: 'var(--ink-muted)' }}>
                {imageUrls.length === 0 ? 'Add photos' : `${10 - imageUrls.length} more`}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    const remaining = 10 - imageUrls.length;
                    const toUpload = files.slice(0, remaining);
                    const newPreviews = toUpload.map(f => URL.createObjectURL(f));
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                    setImageUploading(true);
                    const { uploadPostImages } = await import('@/lib/upload-post-image');
                    const result = await uploadPostImages(toUpload);
                    if ('urls' in result) setImageUrls(prev => [...prev, ...result.urls]);
                    else { alert(result.error); setImagePreviews(prev => prev.slice(0, -toUpload.length)); }
                    setImageUploading(false);
                  }}
                />
              </label>
            )}
            {imageUploading && <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Uploading…</p>}
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

          {/* Archive */}
          {showArchiveConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={handleArchive}
                disabled={archiving}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                style={{ background: 'var(--need)', color: 'white', ...ds }}
              >
                {archiving ? 'Archiving…' : 'Yes, archive post'}
              </button>
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider"
                style={{ background: 'transparent', color: 'var(--ink-muted)', border: '1px solid var(--border-card)', ...ds }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowArchiveConfirm(true)}
              className="w-full py-3 text-xs font-bold uppercase tracking-wider"
              style={{ background: 'transparent', color: 'var(--need)', border: '1px solid var(--need)', ...ds }}
            >
              Archive post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

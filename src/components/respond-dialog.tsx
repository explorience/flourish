'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Post } from '@/types/database';

interface RespondDialogProps {
  post: Post;
  open: boolean;
  onClose: () => void;
}

export function RespondDialog({ post, open, onClose }: RespondDialogProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const supabase = createClient();
    
    const { error } = await supabase.from('responses').insert({
      post_id: post.id,
      responder_name: name.trim(),
      responder_contact: contact.trim() || null,
      message: message.trim() || null,
    });

    if (!error) {
      // Also notify via SMS if the post was from SMS
      if (post.source === 'sms' && post.source_phone) {
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: post.id,
            responderName: name.trim(),
          }),
        }).catch(() => {}); // best effort
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setContact('');
        setMessage('');
        onClose();
      }, 2000);
    }

    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">💚</p>
            <p className="text-lg font-semibold text-amber-900">Response sent!</p>
            <p className="text-amber-600 text-sm mt-1">
              {post.contact_name} will be notified.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-amber-900 mb-1">
              {post.type === 'need' ? 'Offer to help' : 'Express interest'}
            </h3>
            <p className="text-sm text-amber-600 mb-4">
              Re: {post.title}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">
                  Your name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-base"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">
                  How to reach you (optional)
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-base"
                  placeholder="Phone, email, or other"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-base resize-none"
                  rows={3}
                  placeholder="Any details..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-lg border border-amber-200 text-amber-700 font-medium hover:bg-amber-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${
                    post.type === 'need'
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  {submitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

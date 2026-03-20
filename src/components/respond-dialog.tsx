'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Post } from '@/types/database';
import { X } from 'lucide-react';

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
      // Notify poster (works for SMS and could extend to email)
      {
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: post.id,
            responderName: name.trim(),
            responderContact: contact.trim() || null,
            responderMessage: message.trim() || null,
          }),
        }).catch(() => {});
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

  const isNeed = post.type === 'need';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div
        className="bg-[hsl(39,50%,98%)] rounded-t-3xl sm:rounded-3xl w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-16 px-6">
            <p className="text-2xl font-semibold text-[hsl(25,30%,18%)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Response sent
            </p>
            <p className="text-[hsl(25,15%,50%)] text-sm">
              {post.contact_name} will be notified.
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-[hsl(25,30%,18%)]" style={{ fontFamily: 'var(--font-display)' }}>
                  {isNeed ? 'Offer to help' : 'Express interest'}
                </h3>
                <p className="text-sm text-[hsl(25,15%,50%)] mt-0.5">
                  Re: {post.title}
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[hsl(35,30%,90%)] text-[hsl(25,15%,50%)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[hsl(25,15%,50%)] uppercase tracking-wider mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(35,20%,87%)] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(25,45%,35%)]/20 focus:border-[hsl(25,45%,35%)] text-base transition-all"
                  placeholder="Your first name"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[hsl(25,15%,50%)] uppercase tracking-wider mb-1.5">
                  How to reach you <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(35,20%,87%)] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(25,45%,35%)]/20 focus:border-[hsl(25,45%,35%)] text-base transition-all"
                  placeholder="Phone, email, or other"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[hsl(25,15%,50%)] uppercase tracking-wider mb-1.5">
                  Message <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(35,20%,87%)] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(25,45%,35%)]/20 focus:border-[hsl(25,45%,35%)] text-sm resize-none transition-all"
                  rows={3}
                  placeholder="Anything you want them to know..."
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-[hsl(35,20%,87%)] text-[hsl(25,20%,40%)] font-medium text-sm hover:bg-[hsl(35,30%,95%)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm text-white transition-all disabled:opacity-40 ${
                    isNeed
                      ? 'bg-[hsl(18,60%,52%)] hover:bg-[hsl(18,60%,46%)]'
                      : 'bg-[hsl(145,30%,42%)] hover:bg-[hsl(145,30%,36%)]'
                  }`}
                >
                  {submitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

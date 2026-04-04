'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Post } from '@/types/database';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RespondDialogProps {
  post: Post;
  open: boolean;
  onClose: () => void;
}

export function RespondDialog({ post, open, onClose }: RespondDialogProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        onClose();
        router.push('/auth?next=/');
      } else {
        setUserId(data.user.id);
        // Pre-fill name from metadata if available
        const metaName = data.user.user_metadata?.name;
        if (metaName && !name) setName(metaName);
      }
    });
  }, [open]);

  if (!open) return null;
  const isNeed = post.type === 'need';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from('responses').insert({
      post_id: post.id,
      responder_name: name.trim(),
      message: message.trim() || null,
      user_id: userId,
    });
    if (!error) {
      setSubmitted(true);
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#d07040', '#3a6a4a', '#e8e0c8', '#6aaa7a'],
        disableForReducedMotion: true,
      });
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          responderName: name.trim(),
          responderMessage: message.trim() || null,
        }),
      }).catch(() => {});
      setTimeout(() => { setSubmitted(false); setName(''); setMessage(''); onClose(); }, 2500);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 animate-fade-in" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full max-w-md animate-slide-up sm:rounded-md bg-card" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-16 px-6">
            <div className="text-3xl mb-4">🤝</div>
            <p className="text-lg font-bold uppercase tracking-wide mb-2 font-display color-ink">
              {isNeed ? 'You\'re offering to help' : 'You\'re interested'}
            </p>
            <p className="text-sm leading-relaxed font-serif color-ink-light" style={{ fontStyle: 'italic' }}>
              {post.contact_name} will hear from you soon.
            </p>
            <p className="text-xs mt-4 color-ink-muted">This is how communities work.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide font-display color-ink">
                  {isNeed ? 'Offer to help' : 'Express interest'}
                </h3>
                <p className="text-xs mt-1 italic font-serif color-ink-muted">Re: {post.title}</p>
              </div>
              <button onClick={onClose} className="p-1 color-ink-muted"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Your name" value={name} onChange={setName} placeholder="First name" required autoFocus />
              <Field label="Message" value={message} onChange={setMessage} placeholder="Anything you want them to know... you can include your contact info here if you'd like." optional textarea />
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-3 text-xs font-bold uppercase tracking-wider color-ink-light" style={{ border: '1.5px solid var(--border-card)' }}>Cancel</button>
                <button type="submit" disabled={submitting || !name.trim()} className="flex-1 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors font-display color-card" style={{ background: isNeed ? 'var(--need)' : 'var(--offer)' }}>
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

function Field({ label, value, onChange, placeholder, required, optional, autoFocus, textarea }: any) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 font-display color-ink-light" style={{ fontSize: '0.6rem' }}>
        {label} {optional && <span className="normal-case tracking-normal font-normal color-ink-muted">(optional)</span>}
      </label>
      <Tag
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-sm focus:outline-none transition-all font-body color-ink"
        style={{ background: '#fff', border: '1px solid var(--border-card)' }}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        rows={textarea ? 3 : undefined}
      />
    </div>
  );
}

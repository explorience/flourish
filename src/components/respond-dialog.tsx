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
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    });
    if (!error) {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          responderName: name.trim(),
          responderMessage: message.trim() || null,
        }),
      }).catch(() => {});
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setName(''); setMessage(''); onClose(); }, 2000);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 animate-fade-in" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full max-w-md animate-slide-up sm:rounded-md" style={{ background: 'var(--card)' }} onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-16 px-6">
            <p className="text-lg font-bold uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Response sent</p>
            <p className="text-sm mt-2" style={{ color: 'var(--ink-light)' }}>{post.contact_name} will be notified.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                  {isNeed ? 'Offer to help' : 'Express interest'}
                </h3>
                <p className="text-xs mt-1 italic" style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-muted)' }}>Re: {post.title}</p>
              </div>
              <button onClick={onClose} className="p-1" style={{ color: 'var(--ink-muted)' }}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Your name" value={name} onChange={setName} placeholder="First name" required autoFocus />
              <Field label="Message" value={message} onChange={setMessage} placeholder="Anything you want them to know... you can include your contact info here if you'd like." optional textarea />
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-3 text-xs font-bold uppercase tracking-wider" style={{ border: '1.5px solid var(--border-card)', color: 'var(--ink-light)' }}>Cancel</button>
                <button type="submit" disabled={submitting || !name.trim()} className="flex-1 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors" style={{ background: isNeed ? 'var(--need)' : 'var(--offer)', color: 'var(--card)', fontFamily: 'var(--font-display)' }}>
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
      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-light)', fontSize: '0.6rem' }}>
        {label} {optional && <span className="normal-case tracking-normal font-normal" style={{ color: 'var(--ink-muted)' }}>(optional)</span>}
      </label>
      <Tag
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-sm focus:outline-none transition-all"
        style={{ background: '#fff', border: '1px solid var(--border-card)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        rows={textarea ? 3 : undefined}
      />
    </div>
  );
}

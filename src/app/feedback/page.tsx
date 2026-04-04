'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import Link from 'next/link';

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const inputStyle: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border-card)',
    color: 'var(--ink)',
    padding: '12px 16px',
    width: '100%',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Could not send your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-page">
      <Header />

      <div className="flex-1 flex items-start justify-center px-5 py-14">
        <div className="w-full max-w-md">

          <div className="mb-10">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2 font-display color-sub"
            >
              Community
            </p>
            <h1
              className="text-4xl font-extrabold uppercase tracking-wide leading-none mb-3 font-display color-heading"
            >
              Feedback
            </h1>
            <p
              className="text-sm leading-relaxed font-serif color-sub"
              style={{ fontStyle: 'italic' }}
            >
              Got a thought, a bug report, or a suggestion? We&apos;d love to hear it.
            </p>
          </div>

          {success ? (
            <div
              className="p-8 text-center"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div
                className="text-2xl font-extrabold uppercase tracking-wide mb-3 font-display color-offer"
              >
                Thank you
              </div>
              <p
                className="text-sm leading-relaxed mb-6 font-serif color-ink-light"
                style={{ fontStyle: 'italic' }}
              >
                Your message has been sent. We read every piece of feedback.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 text-xs font-bold uppercase tracking-wider font-display btn-ink"
              >
                Back to the board
              </Link>
            </div>
          ) : (
            <div
              className="p-8"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="form-label">
                    Name <span className="color-ink-muted normal-case tracking-normal font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Email <span className="color-ink-muted normal-case tracking-normal font-normal">(optional — if you want a reply)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Message <span className="color-need">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: '7.5rem',
                    }}
                    placeholder="What's on your mind?"
                  />
                </div>

                {error && (
                  <p
                    className="text-xs px-3 py-2"
                    style={{
                      background: 'rgba(208,112,64,0.1)',
                      color: 'var(--need)',
                      border: '1px solid rgba(208,112,64,0.2)',
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="w-full py-3.5 text-sm font-bold uppercase tracking-wider disabled:opacity-40 transition-all font-display btn-ink"
                >
                  {loading ? 'Sending…' : 'Send feedback'}
                </button>
              </form>
            </div>
          )}

          <p
            className="text-xs text-center mt-6 font-display color-ink-muted"
            style={{ letterSpacing: '0.08em' }}
          >
            <Link href="/" className="color-sub">Back to the board</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

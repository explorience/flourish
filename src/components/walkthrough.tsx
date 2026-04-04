'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ds: React.CSSProperties = { fontFamily: 'var(--font-display)' };
const sr: React.CSSProperties = { fontFamily: 'var(--font-serif)' };

const STEPS = [
  {
    title: 'Welcome to the board',
    body: 'This is your neighbourhood exchange. People post what they need and what they can offer - items, skills, services, space, and more.',
    icon: '👋',
  },
  {
    title: 'Browse needs & offers',
    body: 'Each card is a real person in your community. Green cards are offers, orange cards are needs. Tap any card to see details.',
    icon: '📋',
  },
  {
    title: 'Post something',
    body: 'Got something to offer? Need a hand with something? Hit "Post something" and it goes live in seconds. No selling, no money - just neighbours helping neighbours.',
    icon: '✏️',
  },
  {
    title: 'Respond & connect',
    body: 'See something you can help with? Respond to a post and connect privately. Your info stays private until you choose to share it.',
    icon: '🤝',
  },
];

const STORAGE_KEY = 'flourish_walkthrough_done';

export function Walkthrough() {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on first visit
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  if (!show) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
        onClick={dismiss}
      />

      {/* Card */}
      <div
        className="fixed z-50 w-[calc(100%-2rem)] max-w-md transition-all"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div style={{ background: 'var(--card)', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 p-1 transition-colors"
            style={{ color: 'var(--ink-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-8">
            {/* Icon */}
            <div className="text-3xl mb-4">{current.icon}</div>

            {/* Step indicator */}
            <div className="flex gap-1.5 mb-5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 transition-all"
                  style={{
                    width: i === step ? 24 : 8,
                    background: i === step ? 'var(--offer)' : 'var(--border-card)',
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <h2
              className="text-lg font-bold uppercase tracking-wide mb-3"
              style={{ ...ds, color: 'var(--ink)' }}
            >
              {current.title}
            </h2>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ ...sr, color: 'var(--ink-light)' }}
            >
              {current.body}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={dismiss}
                className="text-xs transition-colors"
                style={{ ...ds, color: 'var(--ink-muted)', letterSpacing: '0.05em' }}
              >
                Skip tour
              </button>

              <button
                onClick={next}
                className="px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all"
                style={{
                  ...ds,
                  background: isLast ? 'var(--offer)' : 'var(--ink)',
                  color: 'var(--card)',
                }}
              >
                {isLast ? 'Get started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';

const THEMES = [
  { id: 'evergreen', label: 'Evergreen', swatch: '#1e3a28' },
  { id: 'light', label: 'Light', swatch: '#faf8f4' },
  { id: 'slate', label: 'Slate', swatch: '#22222a' },
  { id: 'parchment', label: 'Parchment', swatch: '#f5f0e0' },
] as const;

type ThemeId = typeof THEMES[number]['id'];

function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute('data-theme', id);
  localStorage.setItem('flourish-theme', id);
}

export function ThemeToggle() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ThemeId>('evergreen');
  const ref = useRef<HTMLDivElement>(null);

  // Read current theme from DOM (already set by inline script in layout)
  useEffect(() => {
    const applied = document.documentElement.getAttribute('data-theme') as ThemeId;
    if (applied) setCurrent(applied);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="theme-toggle" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 md:p-3 rounded transition-colors nav-icon"
        aria-label="Change theme"
        title="Change theme"
      >
        <svg className="w-4 h-4 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </button>

      {open && (
        <div className="theme-menu rounded">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setCurrent(t.id);
                applyTheme(t.id);
                setOpen(false);
              }}
              className={`theme-option w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider ${
                current === t.id ? 'theme-option-active' : ''
              }`}
              aria-label={`${t.label} theme${current === t.id ? ' (active)' : ''}`}
              aria-pressed={current === t.id}
            >
              <span
                className="w-4 h-4 rounded-full border"
                style={{ background: t.swatch, borderColor: 'var(--border)' }}
                aria-hidden="true"
              />
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

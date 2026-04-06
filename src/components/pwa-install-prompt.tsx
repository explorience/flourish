'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const LS_KEY = 'pwa_prompt_seen';

interface PromptState {
  seenCount: number;
}

function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && navigator.maxTouchPoints > 0;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone);
}

function getState(): PromptState {
  if (typeof window === 'undefined') return { seenCount: 0 };
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : { seenCount: 0 };
  } catch {
    return { seenCount: 0 };
  }
}

function bumpSeen(): void {
  const state = getState();
  state.seenCount += 1;
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export function PWAInstallPrompt() {
  const [settings, setSettings] = useState<{ max_shows: number; every_n_visits: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [sessionDismissed, setSessionDismissed] = useState(false);

  useEffect(() => {
    if (!isMobile() || isStandalone()) return;

    // Load settings from app_settings
    createClient().from('app_settings').select('key, value').then(({ data }) => {
      const s: any = {};
      for (const row of data || []) s[row.key] = row.value;
      setSettings({
        max_shows: s.pwa_prompt_max_shows ?? 7,
        every_n_visits: s.pwa_prompt_every_n_visits ?? 10,
      });
    });
  }, []);

  useEffect(() => {
    if (!settings || !isMobile() || isStandalone()) return;

    // Track visit
    const state = getState();
    if (state.seenCount >= settings.max_shows) return;

    // Count this as a visit only when we show the prompt
    // We'll bump seenCount when we actually render the banner
    setDismissed(false);
    setSessionDismissed(false);
  }, [settings]);

  useEffect(() => {
    if (!settings || !isMobile() || isStandalone()) return;

    const state = getState();
    const shouldShow = state.seenCount < settings.max_shows;

    if (shouldShow && !sessionDismissed) {
      setVisible(true);
      bumpSeen(); // Count this show
    } else {
      setVisible(false);
    }
  }, [settings, sessionDismissed]);

  if (!visible || !settings) return null;

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="max-w-md mx-auto rounded-sm p-4 shadow-lg"
        style={{
          background: 'var(--card)',
          border: '1.5px solid var(--border-card)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p
              className="text-sm font-bold mb-1"
              style={{ color: 'var(--ink)', ...{} }}
            >
              Add to your home screen
            </p>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
              {isIOS
                ? 'Tap the share button below, then tap "Add to Home Screen"'
                : 'Tap the menu (⋮) above, then tap "Add to Home Screen" or "Install app"'}
            </p>
          </div>
          <button
            onClick={() => { setSessionDismissed(true); setVisible(false); }}
            className="flex-shrink-0 p-1"
            style={{ color: 'var(--ink-muted)' }}
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

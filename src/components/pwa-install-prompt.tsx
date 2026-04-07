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
  // Android: menu (⋮) is top-right; iOS: share button is bottom toolbar

  // iOS toolbar height varies by device
  const hasDynamicIsland = window.screen.height >= 852 && window.screen.width >= 390;
  const iosToolbarHeight = hasDynamicIsland ? 54 : 44; // px, rough estimate
  const gap = 16;

  // Positioning
  const wrapperStyle: React.CSSProperties = isIOS
    ? { position: 'fixed', left: 0, right: 0, bottom: `${iosToolbarHeight + gap}px`, zIndex: 50, padding: '0 16px', pointerEvents: 'none' }
    : { position: 'fixed', left: 0, right: 0, top: '56px', zIndex: 50, padding: '0 16px', pointerEvents: 'none' };

  // Arrow: points DOWN on iOS (toward bottom toolbar), UP on Android (toward top menu)
  const arrowStyle: React.CSSProperties = isIOS
    ? { position: 'absolute', left: '50%', bottom: '-12px', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '12px solid #ffd84a', filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.3))' }
    : { position: 'absolute', right: '20px', top: '-12px', width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderBottom: '12px solid #ffd84a', filter: 'drop-shadow(0 -2px 0 rgba(0,0,0,0.3))' };

  return (
    <div style={wrapperStyle}>
      <div
        className="max-w-xs relative pointer-events-auto animate-bounce-in"
        style={{
          marginLeft: isIOS ? 'auto' : 'auto',
          marginRight: isIOS ? 'auto' : '0',
          background: '#ffd84a',
          color: '#2a1a00',
          padding: '14px 16px',
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35), 0 0 0 3px rgba(0,0,0,0.15)',
          border: '2px solid #2a1a00',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        <div aria-hidden="true" style={arrowStyle} />

        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p
              className="font-bold mb-0.5"
              style={{ fontSize: '0.95rem', lineHeight: 1.2 }}
            >
              {isIOS ? '👇 Install this app' : '☝️ Install this app'}
            </p>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.35, fontWeight: 500 }}>
              {isIOS
                ? "Tap 'Share', then 'Add to Home Screen'"
                : "Tap the menu (⋮), then 'Add to Home screen'"
              }
            </p>
          </div>
          <button
            onClick={() => { setSessionDismissed(true); setVisible(false); }}
            className="flex-shrink-0"
            style={{
              color: '#2a1a00',
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Dismiss"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';

const ds = { fontFamily: 'var(--font-display)' };

type PushState = 'unsupported' | 'loading' | 'denied' | 'subscribed' | 'unsubscribed';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushManager() {
  const [state, setState] = useState<PushState>('loading');
  const [toggling, setToggling] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }

    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        setCurrentEndpoint(sub.endpoint);
        setState('subscribed');
      } else {
        setState('unsubscribed');
      }
    } catch {
      setState('unsubscribed');
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const subscribe = async () => {
    setToggling(true);
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        console.warn('NEXT_PUBLIC_VAPID_PUBLIC_KEY not set');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState('denied');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });

      if (res.ok) {
        setCurrentEndpoint(sub.endpoint);
        setState('subscribed');
      } else if (res.status === 401) {
        // Not logged in — unsubscribe locally since we can't save it
        await sub.unsubscribe();
        setState('unsubscribed');
      }
    } catch (err) {
      console.error('Push subscribe error:', err);
    } finally {
      setToggling(false);
    }
  };

  const unsubscribe = async () => {
    setToggling(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setCurrentEndpoint(null);
      setState('unsubscribed');
    } catch (err) {
      console.error('Push unsubscribe error:', err);
    } finally {
      setToggling(false);
    }
  };

  if (state === 'loading') {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider w-full opacity-40"
        style={{ ...ds, background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--border)' }}
      >
        <Bell className="w-4 h-4" />
        Push notifications…
      </button>
    );
  }

  if (state === 'unsupported') {
    return null;
  }

  if (state === 'denied') {
    return (
      <div
        className="px-4 py-3 text-xs w-full"
        style={{ ...ds, background: 'var(--card)', color: 'var(--ink-muted)', border: '1px solid var(--border-card)', fontSize: '0.65rem', letterSpacing: '0.05em' }}
      >
        <span className="font-bold uppercase tracking-wider">Push notifications blocked</span>
        <br />
        <span>Enable them in your browser settings.</span>
      </div>
    );
  }

  if (state === 'subscribed') {
    return (
      <button
        onClick={unsubscribe}
        disabled={toggling}
        className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all w-full disabled:opacity-40"
        style={{
          ...ds,
          background: 'rgba(58,106,74,0.1)',
          color: 'var(--ink)',
          border: '1px solid var(--offer)',
        }}
        title={currentEndpoint ?? undefined}
      >
        <BellRing className="w-4 h-4" style={{ color: 'var(--offer)' }} />
        Push notifications on
      </button>
    );
  }

  // unsubscribed
  return (
    <button
      onClick={subscribe}
      disabled={toggling}
      className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all w-full disabled:opacity-40"
      style={{
        ...ds,
        background: 'var(--card)',
        color: 'var(--ink)',
        border: '1px solid var(--border-card)',
      }}
    >
      <BellOff className="w-4 h-4" />
      Push notifications off
    </button>
  );
}

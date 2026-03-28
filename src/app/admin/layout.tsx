import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — Flourish',
  description: 'Flourish moderation dashboard',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {children}
    </div>
  );
}

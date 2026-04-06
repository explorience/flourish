import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toast';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { ServiceWorkerRegister } from '@/components/service-worker-register';
import { APP_NAME, APP_DESCRIPTION, APP_TAGLINE } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_NAME,
  },
  openGraph: {
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
  },
};

// Inline script to apply theme before React hydration (prevents FOUC and setAttribute loop)
const themeScript = `(function(){try{var t=localStorage.getItem('flourish-theme');if(!t||t==='forest-dark')t='evergreen';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="evergreen" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="grain-overlay">
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        {children}
        <Toaster />
        <PWAInstallPrompt />
        <ServiceWorkerRegister />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
          }
        `}} />
      </body>
    </html>
  );
}

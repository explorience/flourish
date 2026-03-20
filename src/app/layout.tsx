import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toast';
import { APP_NAME, APP_DESCRIPTION, APP_TAGLINE } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
  openGraph: {
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="grain-overlay">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

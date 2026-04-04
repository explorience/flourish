import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Flourish — Community Exchange';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Flourish';
  const community = process.env.NEXT_PUBLIC_APP_COMMUNITY || 'your neighbourhood';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#1a2a20',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(58,106,74,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* App name */}
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: '#e8e0c8',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              lineHeight: 1,
              marginBottom: 24,
            }}
          >
            {appName}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 32,
              color: '#a8bfa8',
              lineHeight: 1.4,
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Offer what you have. Ask for what you need.
          </div>

          {/* Divider */}
          <div
            style={{
              width: 60,
              height: 3,
              background: '#3a6a4a',
              margin: '32px 0',
            }}
          />

          {/* Community label */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#3a6a4a',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
          >
            A free community exchange for {community}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

import { NextRequest, NextResponse } from 'next/server';

// Auto-post new listings to Facebook Page
export async function POST(req: NextRequest) {
  try {
    const { post } = await req.json();
    
    const pageId = process.env.FB_PAGE_ID;
    const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;

    if (!pageId || !pageToken) {
      console.log('Facebook not configured, skipping auto-post');
      return NextResponse.json({ ok: true, skipped: true });
    }

    const emoji = post.type === 'need' ? '🙏' : '💚';
    const typeLabel = post.type === 'need' ? 'NEED' : 'OFFER';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flourish.ourlondon.xyz';

    const message = [
      `${emoji} ${typeLabel}: ${post.title}`,
      post.details ? `\n${post.details}` : '',
      `\nCategory: ${post.category}`,
      `Posted by: ${post.contact_name}`,
      `\n👉 Respond at: ${appUrl}`,
      `\n#LondonON #MutualAid #CommunityExchange`,
    ].filter(Boolean).join('\n');

    const fbUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;
    const response = await fetch(fbUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        access_token: pageToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Facebook post error:', error);
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    const result = await response.json();
    return NextResponse.json({ ok: true, fbPostId: result.id });
  } catch (error) {
    console.error('Facebook auto-post error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

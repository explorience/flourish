import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Twilio webhook for inbound SMS
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const formData = await req.formData();
  const body = (formData.get('Body') as string || '').trim();
  const from = formData.get('From') as string || '';

  if (!body) {
    return twimlResponse('Please send a message starting with NEED: or OFFER: followed by what you need or can offer.');
  }

  const upperBody = body.toUpperCase();
  let type: 'need' | 'offer';
  let title: string;

  if (upperBody.startsWith('NEED:') || upperBody.startsWith('NEED ')) {
    type = 'need';
    title = body.slice(body.indexOf(':') >= 0 && body.indexOf(':') < 7 ? body.indexOf(':') + 1 : 5).trim();
  } else if (upperBody.startsWith('OFFER:') || upperBody.startsWith('OFFER ')) {
    type = 'offer';
    title = body.slice(body.indexOf(':') >= 0 && body.indexOf(':') < 8 ? body.indexOf(':') + 1 : 6).trim();
  } else {
    type = 'need';
    title = body;
  }

  if (!title) {
    return twimlResponse('Got it! But please include what you need or are offering. Example: NEED: ride to appointment');
  }

  const category = guessCategory(title);

  const { error } = await supabase.from('posts').insert({
    type,
    title,
    category,
    urgency: 'flexible',
    contact_name: 'SMS user',
    contact_method: 'phone',
    contact_value: from,
    source: 'sms',
    source_phone: from,
  });

  if (error) {
    console.error('SMS post creation error:', error);
    return twimlResponse('Sorry, something went wrong. Please try again!');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://exchange.clawyard.dev';
  const emoji = type === 'need' ? '🙏' : '💚';
  
  return twimlResponse(
    `${emoji} Posted your ${type}! "${title}" is now visible to the community. See it at: ${appUrl}`
  );
}

function guessCategory(title: string): string {
  const lower = title.toLowerCase();
  if (/ride|deliver|moving|childcare|clean|cook|drive|babysit|walk|shovel|mow/.test(lower)) return 'services';
  if (/teach|tutor|fix|repair|translate|help.*with|learn|show.*how/.test(lower)) return 'skills';
  if (/room|space|garage|storage|kitchen|venue|place/.test(lower)) return 'space';
  if (/clothes|coat|food|furniture|bike|tool|book|toy|fabric|supplies/.test(lower)) return 'items';
  return 'other';
}

function twimlResponse(message: string) {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;
  return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

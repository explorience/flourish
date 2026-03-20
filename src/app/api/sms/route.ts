import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://exchange.clawyard.dev';

/*
 * SMS Conversation State Machine
 * 
 * States:
 *   greeting     → new user, ask for name
 *   ask_type     → known user, ask need or offer
 *   ask_title    → ask what they need/offer
 *   ask_details  → ask for extra context
 *   confirm      → show preview, ask YES/EDIT
 *   idle         → waiting for next interaction
 */

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const formData = await req.formData();
  const body = (formData.get('Body') as string || '').trim();
  const phone = formData.get('From') as string || '';

  if (!body || !phone) {
    return twiml('Please text us to get started with Mutual Exchange.');
  }

  const input = body.trim();
  const inputUpper = input.toUpperCase();

  // Check for RESET/START OVER command
  if (inputUpper === 'RESET' || inputUpper === 'START OVER') {
    await supabase.from('sms_sessions').delete().eq('phone', phone);
    return twiml('Fresh start! Are you looking for something (reply NEED) or offering something (reply OFFER)?');
  }

  // Look up user
  const { data: user } = await supabase
    .from('sms_users')
    .select('*')
    .eq('phone', phone)
    .single();

  // Get or create session
  let { data: session } = await supabase
    .from('sms_sessions')
    .select('*')
    .eq('phone', phone)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  // --- NEW USER: never texted before ---
  if (!user) {
    // Create user record (no name yet)
    await supabase.from('sms_users').insert({ phone });

    // Create session in greeting state
    await supabase.from('sms_sessions').insert({
      phone,
      state: 'greeting',
      data: {},
    });

    return twiml(
      `Hey! Welcome to Mutual Exchange - a community board for neighbours in London, ON. ` +
      `Before we get started, what's your first name?`
    );
  }

  // --- RETURNING USER, no active session ---
  if (!session || session.state === 'idle') {
    // Check for quick-post shortcuts: "NEED: ..." or "OFFER: ..."
    if (inputUpper.startsWith('NEED:') || inputUpper.startsWith('NEED ')) {
      const title = extractAfterPrefix(input, 'NEED');
      if (title) {
        return await quickPost(supabase, phone, user.name || 'Neighbour', 'need', title);
      }
    }
    if (inputUpper.startsWith('OFFER:') || inputUpper.startsWith('OFFER ')) {
      const title = extractAfterPrefix(input, 'OFFER');
      if (title) {
        return await quickPost(supabase, phone, user.name || 'Neighbour', 'offer', title);
      }
    }

    // Start new session
    await upsertSession(supabase, phone, 'ask_type', {});

    const greeting = user.name ? `Hey ${user.name}!` : 'Hey!';
    return twiml(
      `${greeting} Are you looking for something (reply NEED) or offering something (reply OFFER)?`
    );
  }

  // --- ACTIVE SESSION: handle based on state ---
  const state = session.state;
  const data: any = session.data || {};

  switch (state) {
    case 'greeting': {
      // They're telling us their name
      const name = input.split(' ')[0]; // Take first word as name
      await supabase.from('sms_users').update({ name }).eq('phone', phone);
      await upsertSession(supabase, phone, 'ask_type', {});

      return twiml(
        `Hi ${name}! Nice to meet you. ` +
        `Are you looking for something (reply NEED) or offering something (reply OFFER)?`
      );
    }

    case 'ask_type': {
      if (inputUpper.startsWith('NEED') || inputUpper === 'N') {
        await upsertSession(supabase, phone, 'ask_title', { type: 'need' });
        return twiml(`What do you need? Just describe it in a few words.`);
      }
      if (inputUpper.startsWith('OFFER') || inputUpper === 'O') {
        await upsertSession(supabase, phone, 'ask_title', { type: 'offer' });
        return twiml(`What are you offering? Just describe it briefly.`);
      }
      return twiml(`Reply NEED if you're looking for something, or OFFER if you have something to share.`);
    }

    case 'ask_title': {
      await upsertSession(supabase, phone, 'ask_details', { ...data, title: input });
      return twiml(
        `Got it. Anything else people should know? ` +
        `Location, timing, details - or reply SKIP if that covers it.`
      );
    }

    case 'ask_details': {
      const details = inputUpper === 'SKIP' || inputUpper === 'NO' ? null : input;
      const fullData = { ...data, details };
      await upsertSession(supabase, phone, 'confirm', fullData);

      const userName = user.name || 'You';
      const typeLabel = fullData.type === 'need' ? 'looking for' : 'offering';
      let preview = `Here's what I'll post:\n\n${userName} is ${typeLabel}: ${fullData.title}`;
      if (details) preview += `\n${details}`;
      preview += `\n\nReply YES to post, or EDIT to start over.`;

      return twiml(preview);
    }

    case 'confirm': {
      if (inputUpper === 'YES' || inputUpper === 'Y' || inputUpper === 'POST') {
        const userName = user.name || 'Neighbour';
        const category = guessCategory(data.title || '');

        const { error } = await supabase.from('posts').insert({
          type: data.type,
          title: data.title,
          details: data.details || null,
          category,
          urgency: 'flexible',
          contact_name: userName,
          contact_method: 'phone',
          contact_value: phone,
          source: 'sms',
          source_phone: phone,
        });

        await upsertSession(supabase, phone, 'idle', {});

        if (error) {
          return twiml(`Sorry, something went wrong. Try again or text RESET to start fresh.`);
        }

        return twiml(
          `Posted! Your neighbours can see it now at ${APP_URL}\n\n` +
          `When someone responds, I'll text you right away. ` +
          `Text anytime to post again.`
        );
      }

      if (inputUpper === 'EDIT' || inputUpper === 'NO' || inputUpper === 'CHANGE') {
        await upsertSession(supabase, phone, 'ask_type', {});
        return twiml(`No problem. Let's start over. NEED or OFFER?`);
      }

      return twiml(`Reply YES to post it, or EDIT to change it.`);
    }

    default: {
      await upsertSession(supabase, phone, 'idle', {});
      return twiml(`Something got mixed up. Text NEED or OFFER to start a new post.`);
    }
  }
}

// --- Helper functions ---

async function upsertSession(supabase: any, phone: string, state: string, data: any) {
  // Delete old sessions, create new one
  await supabase.from('sms_sessions').delete().eq('phone', phone);
  await supabase.from('sms_sessions').insert({
    phone,
    state,
    data,
  });
  // Update last_active
  await supabase.from('sms_users').update({ last_active_at: new Date().toISOString() }).eq('phone', phone);
}

async function quickPost(supabase: any, phone: string, name: string, type: string, title: string) {
  const category = guessCategory(title);

  const { error } = await supabase.from('posts').insert({
    type,
    title,
    category,
    urgency: 'flexible',
    contact_name: name,
    contact_method: 'phone',
    contact_value: phone,
    source: 'sms',
    source_phone: phone,
  });

  const APP_URL_local = process.env.NEXT_PUBLIC_APP_URL || 'https://exchange.clawyard.dev';

  if (error) {
    return twiml(`Sorry, something went wrong. Try again!`);
  }

  return twiml(
    `Posted your ${type}: "${title}"\n` +
    `Your neighbours can see it at ${APP_URL_local}\n` +
    `I'll text you when someone responds.`
  );
}

function extractAfterPrefix(input: string, prefix: string): string {
  const idx = input.indexOf(':');
  if (idx >= 0 && idx < prefix.length + 2) {
    return input.slice(idx + 1).trim();
  }
  return input.slice(prefix.length).trim();
}

function guessCategory(title: string): string {
  const lower = title.toLowerCase();
  if (/ride|deliver|moving|childcare|clean|cook|drive|babysit|walk|shovel|mow/.test(lower)) return 'services';
  if (/teach|tutor|fix|repair|translate|help.*with|learn|show.*how/.test(lower)) return 'skills';
  if (/room|space|garage|storage|kitchen|venue|place/.test(lower)) return 'space';
  if (/clothes|coat|food|furniture|bike|tool|book|toy|fabric|supplies/.test(lower)) return 'items';
  return 'other';
}

function twiml(message: string) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;
  return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

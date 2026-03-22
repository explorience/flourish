import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://flourish.ourlondon.xyz';

const SYSTEM_PROMPT = `You are the SMS assistant for Flourish, a community exchange board for people in London, Ontario. People text you to post needs and offers to the community board.

Your job is to have a warm, brief conversation to gather what they want to post. You are friendly, neighbourly, and concise - every message costs them time to read on a small screen.

LANGUAGE RULES:
- Detect the language the user is writing in and respond in that same language throughout the conversation
- If they switch languages, switch with them
- English, French, Arabic, Spanish, Hindi, Punjabi, Mandarin, Cantonese, Portuguese, Somali, Tagalog — handle all of these naturally
- Never comment on the language switch, just do it

GENERAL RULES:
- Keep responses under 160 characters when possible (SMS length), max 300 chars
- Be warm but brief. You're a neighbour, not a corporation
- Never use emojis
- Use casual language, contractions, first names
- If they text something ambiguous, ask one clarifying question - don't guess

You manage a conversation to create posts. Each post needs:
1. Type: "need" or "offer"
2. Title: short description (what they need or are offering)
3. Details: optional extra context
4. Category: one of "items", "services", "skills", "space", "other"
5. Location: optional — ask "Whereabouts in the city? E.g. Dundas & Adelaide (or just say skip)" — accept any intersection, landmark, or neighbourhood name. Never press if they skip.

CONVERSATION FLOW:
- If this is a NEW user (no name yet): welcome them and ask their first name
- If you know their name: greet them and figure out if they have a need or offer
- Once you understand what they want to post, confirm it with them before posting
- Returning users who text "NEED: ..." or "OFFER: ..." want a quick post - confirm and post it

When you have enough information to create a post, respond with a JSON block at the END of your message:
{"action":"post","type":"need|offer","title":"...","details":"...or null","category":"items|services|skills|space|other","location":"...cross-street or area or null"}

Only include the JSON when you're ready to post AND the user has confirmed. The JSON must be on its own line at the very end.

LEARNING THE USER'S NAME: Whenever you become confident you know the user's first name (from any phrasing — "I'm Heenal", "call me H", "it's Priya", "Heenal here", etc.), add "learnedName":"FirstName" to ANY JSON block you send. If you're not confident, omit it. You only need to include it once.

When you just want to chat/ask questions, respond with plain text only - no JSON.

EXAMPLES OF GOOD RESPONSES:
- "Hey! Welcome to Flourish. What's your first name?"
- "Hi Sarah! What can I do for you - need something or have something to offer?"
- "Got it - a ride to Vic Hospital on Tuesday afternoon. Want me to post that?"
- "Posted! I'll text you when someone responds."`;

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const formData = await req.formData();
  const body = (formData.get('Body') as string || '').trim();
  const phone = formData.get('From') as string || '';

  if (!body || !phone) {
    return twiml('Text us to get started with Flourish.');
  }

  // Look up user in unified profiles table
  const { data: user } = await supabase
    .from('profiles')
    .select('id, display_name, phone, user_id')
    .eq('phone', phone)
    .single();

  // Get conversation history
  const { data: sessions } = await supabase
    .from('sms_sessions')
    .select('*')
    .eq('phone', phone)
    .order('created_at', { ascending: true })
    .limit(20);

  // Build message history for the LLM
  const userContext = user?.display_name && user.display_name !== 'Neighbour'
    ? `The user's name is ${user.display_name}. They've used the service before.`
    : `This is a new user. We don't know their name yet.`;

  const messages: { role: string; content: string }[] = [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\n${userContext}` },
  ];

  // Add conversation history
  if (sessions && sessions.length > 0) {
    for (const s of sessions) {
      const data = s.data as any;
      if (data?.user_message) {
        messages.push({ role: 'user', content: data.user_message });
      }
      if (data?.assistant_message) {
        messages.push({ role: 'assistant', content: data.assistant_message });
      }
    }
  }

  // Add the new message
  messages.push({ role: 'user', content: body });

  // Call MiniMax M2.7
  const llmResponse = await callMiniMax(messages);

  if (!llmResponse) {
    return twiml('Sorry, having a moment. Text again in a sec?');
  }

  // Check if the LLM wants to create a post
  const { text, thinking, postData } = parseResponse(llmResponse);

  // Save this exchange to conversation history (thinking logged for QA, not sent to user)
  await supabase.from('sms_sessions').insert({
    phone,
    state: postData ? 'posted' : 'chatting',
    data: {
      user_message: body,
      assistant_message: text,
      thinking: thinking || null,
    },
  });

  // Upsert profile record (SMS users get a profile row immediately)
  if (!user) {
    await supabase.from('profiles').insert({
      id: crypto.randomUUID(),
      phone,
      display_name: 'Neighbour',
      created_via: 'sms',
    });
  }

  // Let the LLM tell us the name via learnedName in the response JSON
  if (postData?.learnedName && (!user?.display_name || user.display_name === 'Neighbour')) {
    const n = postData.learnedName.trim();
    if (n.length >= 2 && n.length <= 40) {
      await supabase.from('profiles').update({ display_name: n }).eq('phone', phone);
    }
  }

  // Create the post if LLM returned action data
  if (postData) {
    const userName = user?.display_name || 'Neighbour';
    const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://flourish.ourlondon.xyz';

    // Use the posts API route so geocoding runs
    const postRes = await fetch(`${APP_ORIGIN}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: postData.type,
        title: postData.title,
        details: postData.details || null,
        category: postData.category || 'other',
        urgency: 'flexible',
        contact_name: userName,
        contact_method: 'phone',
        contact_value: phone,
        source: 'sms',
        source_phone: phone,
        location_crossstreet: postData.location || null,
        location_label: postData.location || null,
      }),
    });

    if (!postRes.ok) {
      return twiml('Sorry, something went wrong posting that. Try again?');
    }

    // Update last_active
    await supabase.from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('phone', phone);
  }

  return twiml(text);
}

async function callMiniMax(messages: { role: string; content: string }[]): Promise<string | null> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    console.error('MINIMAX_API_KEY not set');
    return null;
  }

  try {
    const response = await fetch('https://api.minimax.io/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('MiniMax API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('MiniMax API call failed:', error);
    return null;
  }
}

function stripThinking(response: string): { visible: string; thinking: string } {
  // Strip <think>...</think> blocks — M2.7 reasoning model includes these
  const thinkMatch = response.match(/<think>([\s\S]*?)<\/think>/i);
  const thinking = thinkMatch ? thinkMatch[1].trim() : '';
  const visible = response.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  return { visible, thinking };
}

function parseResponse(response: string): { text: string; thinking: string; postData: any | null } {
  const { visible, thinking } = stripThinking(response);

  // Look for any JSON block at the end of the response
  const jsonMatch = visible.match(/\{[^{}]*\}$/m);
  
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      // Only treat as postData if it has action:"post"
      const postData = parsed.action === 'post' ? parsed : (parsed.learnedName ? { learnedName: parsed.learnedName } : null);
      const text = visible.slice(0, visible.lastIndexOf(jsonMatch[0])).trim();
      return { text: text || 'Posted!', thinking, postData };
    } catch {
      return { text: visible, thinking, postData: null };
    }
  }

  return { text: visible, thinking, postData: null };
}

function twiml(message: string) {
  // Trim to SMS-friendly length
  const trimmed = message.length > 1600 ? message.slice(0, 1597) + '...' : message;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(trimmed)}</Message>
</Response>`;
  return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

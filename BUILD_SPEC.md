---
title: Mutual Exchange App - Build Spec for Sunday Demo
type: spec
created: 2026-03-20
deadline: 2026-03-22 (Sunday 1pm EST)
---

# Mutual Exchange App - Build Spec

## Overview

A simple intent board where people post what they need or what they can offer. Community responds. No money, no accounts needed for demo.

Live demo at Sunday meeting - real-time, interactive, people in the room posting from their phones.

## Core Features (Must Have for Sunday)

### 1. Post Creation
- **Type:** Need / Offer (toggle or tabs)
- **Fields:**
  - Title (required, short)
  - Details (optional, free text)
  - Category: Items / Services / Skills / Space / Other
  - Urgency: Flexible / This week / Today
  - Contact name (required)
  - Contact method: in-app message / phone / email (pick one, enter value)
- No photos required
- No account required for demo

### 2. Feed / Browse
- Live feed of all posts, newest first
- Real-time updates (new posts appear without refresh)
- Filter by: type (Need/Offer), category
- Mobile-first responsive design
- Clean, warm, accessible UI - not corporate, not techy

### 3. SMS Integration (Twilio)
- Inbound: text to a number, post appears on feed
- Format: `NEED: description` or `OFFER: description`
- Auto-categorize if possible, default to "Other"
- Reply back with confirmation + link to post
- Webhook endpoint for Twilio

### 4. Facebook Page Auto-Post
- When a new post is created on the app, auto-post to a Facebook Page
- One-way: app → Facebook
- Include post type, title, details, link back to app
- Use Facebook Graph API with Page access token

### 5. Respond to Post
- Simple "I can help" / "I'm interested" button on each post
- Clicking it reveals contact info or sends a notification
- Keep it minimal - no full messaging system needed

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (Postgres + Realtime)
- **Styling:** Tailwind CSS + shadcn/ui
- **SMS:** Twilio (webhook)
- **Facebook:** Graph API (Page auto-post)
- **Hosting:** Hetzner server (clawyard.dev), Caddy reverse proxy
- **Domain:** exchange.clawyard.dev

## Design Notes

- Mobile-first (people will demo on phones Sunday)
- Big, clear buttons - not a wall of text
- Warm colors, community feel
- Accessibility: good contrast, readable fonts, works on cheap phones
- No login wall for demo - anyone with the URL can post and browse
- Landing page: brief "what is this" + immediate access to feed

## Data Model

### posts
- id (uuid)
- type (enum: need, offer)
- title (text)
- details (text, nullable)
- category (enum: items, services, skills, space, other)
- urgency (enum: flexible, this_week, today)
- contact_name (text)
- contact_method (enum: app, phone, email)
- contact_value (text)
- source (enum: web, sms)
- status (enum: active, fulfilled, expired)
- created_at (timestamp)
- updated_at (timestamp)

### responses
- id (uuid)
- post_id (uuid, FK)
- responder_name (text)
- responder_contact (text)
- message (text, nullable)
- created_at (timestamp)

## Deployment

- PM2 managed on Hetzner
- Caddy reverse proxy with SSL (exchange.clawyard.dev)
- Supabase project (free tier is fine for demo)
- Environment vars: SUPABASE_URL, SUPABASE_ANON_KEY, TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE, FB_PAGE_TOKEN, FB_PAGE_ID

## Out of Scope for Sunday

- User accounts / authentication
- Vouch-based trust system
- Neighbourhood/scope filtering
- Map view
- Timebanking / credits
- Full messaging system
- Admin dashboard

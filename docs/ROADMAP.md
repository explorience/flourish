# Flourish Roadmap

> Last updated: 2026-04-04

## Where we are

Flourish is a live community exchange board at [flourish.ourlondon.xyz](https://flourish.ourlondon.xyz). The core product is built: people can post needs and offers, respond to each other, message privately, find posts on a map, and get email notifications. SMS posting works via Twilio. Moderation and admin tools are in place.

We're at the "first 10 real users" stage. The organizing team has tested the app. The next milestone is getting people to actually use it — and come back.

## Completed (v1)

- [x] Post needs and offers (web + SMS)
- [x] In-app private messaging with real-time updates
- [x] Email notifications (new responses, post confirmations, daily digest)
- [x] Map view with fuzzed location pins
- [x] User profiles with neighbourhood and bio
- [x] Content moderation + admin dashboard
- [x] Search
- [x] Multi-theme support (dark forest, light, evergreen)
- [x] Mobile-responsive design
- [x] About page, code of conduct, moderator guide
- [x] FAQ page
- [x] First-time walkthrough tour
- [x] Welcome banner for new visitors
- [x] OG image for link previews
- [x] Vouch system (built, toggled off — ready when needed)
- [x] Post types: need / offer
- [x] Categories: items, services, skills, space, other
- [x] Urgency levels: flexible, this week, today
- [x] 30-day auto-expiry
- [x] SMS bridge (MiniMax M2.7 LLM-powered, multilingual)

---

## Phase 1: First Users (next 2 weeks)

Focus: reduce friction, give people reasons to come back, make it feel alive.

### P1-1: Post editing
Users can't edit their posts after publishing. Typos happen. Simple edit form on the post detail page for the post owner.
- **Effort:** Small
- **Impact:** Medium (reduces frustration)

### P1-2: Post expiry reminders
Email/notification 3 days before a post expires: "Your post 'Looking for a bicycle' expires in 3 days. Still need it?" with options to extend or mark fulfilled.
- **Effort:** Small
- **Impact:** Medium (keeps board fresh + active)

### P1-3: Web push notifications
Browser push notifications for "someone responded to your post" and "new message." No app install needed. Uses the Web Push API + service worker (already have a SW registered).
- **Effort:** Medium
- **Impact:** High (biggest driver of return visits)

### P1-4: Category + neighbourhood filtering on board
Filter buttons on the main board: by category (items, services, skills, space) and by neighbourhood. Currently search exists but isn't prominent enough.
- **Effort:** Small
- **Impact:** Medium (helps people find relevant posts as volume grows)

### P1-5: "Me too" on needs
Lightweight "+1" button on need posts. "3 other people also need this." Signals demand without duplicate posts. Could help the community self-organize (e.g., if 5 people need rides to the market, someone might offer a carpool).
- **Effort:** Small
- **Impact:** Medium (social proof, community signal)

### P1-6: Remove remaining inline styles
Replace all inline `style={}` attributes with CSS classes for theme consistency and maintainability. (GitHub issue #11)
- **Effort:** Medium
- **Impact:** Low (developer experience, not user-facing)

---

## Phase 2: Growing (month 1-2, 20-50 users)

Focus: make the board useful enough to check regularly, bridge to where people already are.

### P2-1: Recurring posts
"I offer bike tune-ups every Saturday" as a recurring post that auto-renews. Keeps the board populated with standing offers without requiring people to repost manually.
- **Effort:** Medium
- **Impact:** High (standing offers are the backbone of a healthy exchange)

### P2-2: Neighbourhood scoping
Users see posts from their neighbourhood first, with the option to expand to all. Requires neighbourhood data on posts (partially built via profiles). GitHub issue #7.
- **Effort:** Medium
- **Impact:** High (relevance increases as the board grows)

### P2-3: Category landing pages
Browsable sections at /items, /services, /skills, /space. Each with its own mini-feed. Makes the board feel bigger and easier to navigate.
- **Effort:** Small
- **Impact:** Medium

### P2-4: Activity digest improvements
"3 new posts this week in your area" — a reason to come back. Upgrade the existing daily digest to be more useful: personalised by neighbourhood, highlights new posts in your categories of interest.
- **Effort:** Medium
- **Impact:** High (retention driver)

### P2-5: Facebook cross-posting
Auto-post new needs/offers to a connected Facebook group. Meets people where they already are. Doesn't require them to leave Facebook — but the response happens on Flourish, which pulls them in.
- **Effort:** Medium
- **Impact:** High (acquisition channel for the demographic doing mutual aid in London ON)

### P2-6: Post images
Allow attaching a photo to a post. "Free couch — here's what it looks like." Uses Supabase Storage (already configured).
- **Effort:** Small-Medium
- **Impact:** Medium (trust + clarity)

---

## Phase 3: Deepening Trust (month 3+, 50+ users)

Focus: portable trust, on-chain attestations, multi-community support.

### P3-1: Activate vouch system
Flip the admin toggle. Existing members vouch for new members before they can post. All the code is built and waiting.
- **Effort:** Zero (toggle flip)
- **Impact:** High (trust layer, but only when needed)

### P3-2: TrustGraph + WaaP integration
On-chain trust attestations via TrustGraph (EAS on Optimism). Invisible wallets via WaaP (human.tech). Users see "Sarah vouched for you" — never see wallets, gas, or chains. Full spec at `docs/VOUCH_SYSTEM_SPEC.md`.
- **Effort:** Large
- **Impact:** High (portable trust across communities)

### P3-3: Multi-community support
Other neighbourhoods or cities running their own Flourish instance. Environment variable configuration already supports this. Need: deployment guide, seed script, admin setup flow.
- **Effort:** Medium
- **Impact:** High (scale beyond London ON)

### P3-4: Partner API
Let community organizations (food banks, repair cafes, tool libraries, community fridges) post programmatically. Simple REST API with API key auth.
- **Effort:** Medium
- **Impact:** Medium (keeps board populated with institutional offers)

### P3-5: PWA improvements
Better offline support, install prompts, app-like navigation. Cache posts for offline browsing. Background sync for posting when connectivity is spotty.
- **Effort:** Medium
- **Impact:** Medium

### P3-6: Mutual credit layer
The big dream. A lightweight timebank / mutual credit system layered on top of the exchange. Optional, opt-in. Not a currency — a way to acknowledge contribution without creating debt. Only worth building after the gift economy is working without it.
- **Effort:** Large
- **Impact:** Potentially transformative (but premature until social dynamics are proven)

---

## What we won't build

These are conscious decisions, not oversights:

- **Gamification / points / badges** — Creates wrong incentives for mutual aid. Rewards the already-resourced.
- **Algorithmic feed** — Chronological is a feature. Everyone's post gets equal visibility.
- **Real-time chat** — Async messaging is intentional. People are busy. Don't create urgency pressure.
- **User ratings / reviews** — This isn't Amazon or Uber. Trust comes from community, not stars.
- **Monetization features** — No premium tiers, no promoted posts, no ads. Ever.
- **Exchange tracking / completion metrics** — Discussed and rejected. Tracking rewards capacity, disadvantages the most precarious people. The board connects people, then gets out of the way.

---

## How to prioritize

The honest truth: the next month isn't about features. It's about **whether 10 people use it twice**. Seed posts, word of mouth, and showing up at organizing meetings matter more than code.

Build order should follow what real users ask for, not what's technically interesting. After each phase, check:

1. Are people posting?
2. Are people responding?
3. Are people coming back?

If the answer to any of these is no, the fix is probably not a feature.

# Mutual Exchange App — SPEC v1.0

**Status:** Draft for review
**Date:** 2026-04-01
**Branch:** `improvements/2026-04-01-mutual-credit-spec`

---

## 1. Concept & Vision

A London, Ontario-based **mutual exchange network** — an intent board where neighbours state what they need, what they can offer, and find each other. No money changes hands. No algorithm. No algorithmic feed. Just humans in community.

The feeling: walking into a village square where a corkboard has handwritten notes — "I have extra tomato plants, who wants some?" and "Looking for someone to walk my dog twice a week" — and knowing this is a place where people actually help each other.

**Core principle:** Gift-first, exchange-second. The goal is mutual aid, not transaction. Reputation comes from the community knowing you, not from stars out of 5.

**Differentiation from existing tools:**
- Not Facebook (no algorithm, no ads, no infinite scroll, no anonymous posts)
- Not Craigslist (trust layer, community anchoring, real relationships)
- Not Nextdoor (no hyperlocal HOA energy, no fear-mongering, no real estate posts)
- Not Shareish (better UX, focused on intent matching, not just browsing inventory)
- Inspired by Potluck's claim/offer model, but broadened to skills/services/resources

---

## 2. Design Language

**Aesthetic:** Warm, analogue, community-board energy. Think handwritten notes, torn paper edges, thumbtacks, warm light. NOT corporate platform blue. NOT startup minimalism. Something that feels like your community centre bulletin board.

**Colours:**
- Background: `#F7F3EE` (warm cream, like aged paper)
- Surface: `#EDE8E0` (soft linen)
- Primary: `#7A9E7E` (sage green — growth, earth, trust)
- Accent: `#D4A843` (warm gold — generosity, warmth)
- Text: `#3D3D3D` (warm charcoal — readable, not harsh)
- Danger: `#C4715A` (terracotta — warm red for urgency flags)

**Typography:**
- Headings: `Nunito` (rounded, warm, approachable)
- Body: `Lexend` (reduced visual stress, accessible)
- Mono/labels: system monospace

**Motion:** Minimal, purposeful. New posts fade in. Confirmations pulse gently. Nothing bounces or slides unless it has to.

---

## 3. Post Types

Every post is one of:

| Type | Description |
|------|-------------|
| **OFFER** | I have something to give or share |
| **REQUEST** | I need something |
| **SKILL SHARE** | I can teach/do this with you |
| **LOOKING FOR** | Seeking a person, not a thing |
| **EVENT** | A free gathering or activity |

### Post Schema

```
TITLE: [clear, human headline]
TYPE: OFFER | REQUEST | SKILL SHARE | LOOKING FOR | EVENT
CATEGORY: Food | Labour | Skills | Things | Space | Care | Transport | Other
SCOPE: Neighbourhood | London-wide | Open
URGENCY: Flexible | This week | Today (only for Requests)
DETAILS: [free text, markdown supported]
CONTACT: app DM | phone | email
EXPIRES: [optional date]
```

**No price field. No photos required. No ratings after completion — just "exchange happened: yes/no."**

---

## 4. Trust Model

### v1: Vouch-Based Onboarding

Sign up → **read-only mode** (browse, no post). Someone already in the network vouches for you → you can post. Your voucher's name is on your profile. If you cause problems, they're accountable — social pressure moderates behaviour.

This mirrors how real communities actually work. New people need to be known by someone.

### Transaction Confirmation

On every exchange: did it happen? A simple yes/no, no stars. Over time, this builds a **completion rate** visible on profiles.

### v2 (future): Geographic + Community Anchoring

Users are tied to neighbourhoods (Wortley Village, Old South, OEV, etc.) on signup. Posts can be scoped to neighbourhood or city-wide. Neighbourhood identity creates accountability.

### What we're NOT doing v1

- No blockchain or crypto wallet
- No TrustGraph or on-chain attestation
- No algorithmic trust scores
- No mandatory ID verification (trust is social, not bureaucratic)

---

## 5. Technical Architecture

### Stack

- **Framework:** Next.js 14 (App Router) — existing fork from Potluck
- **Database:** Supabase (Postgres + Auth + Storage) — already wired up
- **Styling:** Tailwind CSS + shadcn/ui — already configured
- **Deployment:** Vercel (team: Reimagine Co)
- **Email:** Resend — already in deps

### Data Model (key tables)

```sql
-- Users (extends Supabase auth.users)
profiles: id, username, full_name, neighbourhood, avatar_url, bio,
          vouched_by (profile_id), vouched_at, completed_exchanges,
          declared_exchanges, created_at

-- Posts
posts: id, author_id, type, title, category, scope, urgency,
       details (markdown), contact_method, expires_at,
       exchange_happened (null|yes|no), created_at

-- Exchanges (confirmations)
exchanges: id, post_id, responder_id, status (confirmed|cancelled),
           confirmed_at, notes

-- Neighbourhoods
neighbourhoods: id, name, slug, city
```

### Moderation

- Posts can be flagged by any user
- Flagged posts go to a moderation queue (simple admin panel)
- Repeat offenders: vouches can be revoked by neighbourhood admins
- No AI moderation v1 — community-driven

### Accessibility

v1 prioritizes:
- Mobile-first, works on $50 Android
- SMS bridge option (Twilio) — text a post, get notified by text
- Email digest — daily summary of neighbourhood posts
- Facebook/Buy Nothing bridge via OpenClaw browser automation (secondary, fragile — keep existing groups running in parallel during migration)

---

## 6. MVP Scope (v1 ships these)

### Must Have

1. User auth (email magic link via Supabase)
2. Vouch system (voucher selects a new user to vouch for)
3. Create/view/filter posts by type, category, scope, neighbourhood
4. Post response flow (DM contact or claim intent)
5. Simple completion confirmation (exchange happened: yes/no)
6. Neighbourhood browsing + neighbourhood switching
7. Mobile-responsive layout
8. Read-only mode for un-vouched users

### Not v1

- SMS/Twilio integration
- Email digest
- Map view
- Facebook bridge
- ActivityPub federation
- Notifications system
- Advanced moderation tools

---

## 7. Open Questions / Risks

### Risk 1: Liquidity — will there be enough supply AND demand?

The chicken-and-egg problem: people won't post if there's no activity; activity won't grow if people don't post. **Mitigation:** Seed with Heenal's existing network (Greenpill, ICS, Repair Cafe contacts) before public launch. Launch with 30-50 seed posts from known community members. Set expectation that v1 is a small pilot group.

### Risk 2: Vouch bottleneck — what if only 2-3 people can vouch?

If vouching requires "established members," you create a power structure that gates newcomers. **Mitigation:** Define "vouchable" broadly — anyone with an established social media presence, or who shows up at a community event tied to the app, can be vouched. Make the vouch process low-friction.

### Risk 3: Scope creep from community partners

Multiple organizations (ICS, FCE, Repair Cafe, Forest City Events) may want to use this for different purposes. Without governance, it becomes everything to everyone and coherent to no one. **Mitigation:** v1 is explicitly a London, Ontario neighbourhood exchange. Partners can use it but the brand and UX are for individual neighbours. Set a clear "no organizational accounts v1" rule.

---

## 8. Differentiation from Timebanking

Traditional timebanking (Hours for Hours, timebanks): You earn time credits for helping, spend them getting help. It's transactional.

**This is not a timebank.** Mutual Exchange is:
- **Gift-first:** Offers come without expectation of return
- **Intent-based:** You're saying "I want this" or "I can offer this" — matching happens in the community, not through a ledger
- **Relationship-preserving:** No credits means no debt. You're neighbours, not counterparties.
- **Simpler:** No hour-math. No earning/spending. Just finding each other.

The reciprocity happens organically: over time, people who give a lot earn trust and reputation naturally. No token required.

---

## 9. Success Metrics (v1 Pilot)

- 50 registered users in first month
- 30% post a need or offer in first month
- 60% completion rate on exchanges (confirmed happened)
- 10+ neighbourhood vouches granted
- Net promoter score: measure qualitatively through conversations

---

## 10. Build Status

**Existing work:**
- Potluck fork at `code/mutual-exchange-app/` (Next.js 14, Supabase, shadcn/ui)
- Auth + basic Supabase schema wired (see `SUPABASE_MIGRATION.sql`)
- Core UI components built (post cards, create form, neighbourhood switcher)

**Next step: Q2 Build Sprint**
Target: deploy pilot to 20-30 users by May 1, 2026.
Focus: complete the post CRUD, add vouch flow, tie to real Supabase project.

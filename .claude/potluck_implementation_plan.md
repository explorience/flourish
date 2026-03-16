# Potluck — Implementation Plan

**Version:** 0.1.0
**Date:** March 16, 2026
**Status:** Draft

-----

## 1. Implementation Philosophy

Ship the smallest useful thing first. Each phase produces a working, deployable application. No phase depends on incomplete work from another phase. Every phase ends with something a real person could use.

-----

## 2. Phase Overview

|Phase|Name                     |Duration|Outcome                                                       |
|-----|-------------------------|--------|--------------------------------------------------------------|
|**0**|Scaffold & Infrastructure|1–2 days|Repo, Supabase project, Vercel deploy, auth working           |
|**1**|Core Loop                |3–4 days|Host creates potluck → participant claims needs → live updates|
|**2**|Guest Access & Sharing   |2–3 days|Guest participation, link sharing, invite codes, public feed  |
|**3**|Points & Verification    |2–3 days|Host verifies contributions, points awarded, profile page     |
|**4**|Polish & Launch          |2–3 days|Solarpunk design pass, mobile polish, OG images, error states |

**Total estimated duration:** 10–15 days for a solo developer or small team.

-----

## 3. Phase 0 — Scaffold & Infrastructure

**Goal:** A deployed skeleton app with auth, database, and CI.

### Tasks

**0.1 — Project initialization**

- `npx create-next-app@latest potluck --typescript --tailwind --app --src-dir`
- Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `shadcn/ui`, `lucide-react`
- Configure Tailwind with solarpunk color palette (warm greens, terracotta, cream, soft black)
- Initialize shadcn/ui with custom theme

**0.2 — Supabase project setup**

- Create Supabase project
- Run initial migration: `profiles` table + trigger to auto-create profile on auth.users insert
- Configure auth providers: email/password + Google OAuth
- Create `banners` storage bucket with public read policy
- Generate TypeScript types: `supabase gen types typescript`

**0.3 — Auth integration**

- Implement `@supabase/ssr` middleware for session management
- Build login/signup page (`/auth/login`) with email + Google options
- Protected route wrapper for `/create` and `/dashboard`
- Auth context provider for client components

**0.4 — Vercel deployment**

- Connect repo to Vercel
- Set environment variables
- Confirm deploy pipeline works (push to main → auto deploy)

### Deliverable

A deployed app at `potluck.vercel.app` with working login/signup and an empty homepage.

-----

## 4. Phase 1 — Core Loop

**Goal:** The fundamental create → claim → view loop works end-to-end.

### Tasks

**1.1 — Database: core tables**

- Migration: create `potlucks`, `needs`, `claims`, `offers` tables
- RLS policies for all tables (host-only writes on potlucks/needs, open writes on claims)
- Slug generation function (Postgres function or app-level nanoid)
- Regenerate TypeScript types

**1.2 — Create Potluck page (`/create`)**

- Form: title, description, date/time picker, location, access level toggle, open offers toggle
- Banner image upload (drag-and-drop or click, uploads to Supabase Storage)
- Needs builder: inline list with emoji picker, name, quantity fields, add/remove/reorder
- Points toggle + per-need point value input (conditionally shown)
- Submit → creates potluck + needs in a single API route transaction
- Redirect to `/p/[slug]/manage` on success

**1.3 — Potluck detail page (`/p/[slug]`)**

- Server-side fetch of potluck + needs + claims
- Title card: banner image, title, description, date, location
- Needs list: emoji + name + quantity + claim status (e.g., “2 of 3 claimed”)
- Claim button on each need (authenticated users only in this phase)
- Unclaim button if already claimed
- Realtime subscription: claims update live without page refresh

**1.4 — Host manage page (`/p/[slug]/manage`)**

- Same potluck display as detail page
- Edit potluck details inline
- Add/edit/remove needs
- View all claims with participant names
- Share section: copy link button

**1.5 — Realtime integration**

- Subscribe to `claims` and `offers` tables filtered by potluck_id
- Optimistic UI updates on claim/unclaim with rollback on error

### Deliverable

An authenticated user can create a potluck with needs, share the link, and another authenticated user can claim needs with live updates.

-----

## 5. Phase 2 — Guest Access & Sharing

**Goal:** Anyone can participate without an account. Potlucks are discoverable.

### Tasks

**2.1 — Guest claim flow**

- When an unauthenticated user taps “Claim,” show a minimal modal: display name (required) + email (optional)
- Store as `guest_name` / `guest_email` on the claim
- Persist guest identity in localStorage for the session (so they don’t re-enter for multiple claims on the same potluck)
- Soft prompt after claim: “Create an account to earn Potluck Points” with dismiss option

**2.2 — Guest offers**

- Same guest identity flow for open offers
- Emoji picker + name + optional description

**2.3 — Invite system**

- API route: generate invite codes (nanoid, 8 chars)
- `/invite/[code]` page: validates code, marks as accepted, redirects to potluck
- Host can generate multiple codes or enter email addresses to send invites
- Email sending via Supabase Edge Function or simple Resend integration

**2.4 — Public homepage**

- `/` page: server-side query for `potlucks WHERE access_level = 'public' AND status = 'active' ORDER BY event_date ASC`
- Card grid: banner thumbnail, title, date, location, progress bar (needs claimed / total)
- Simple keyword search (Postgres `ILIKE` on title + description)
- Pagination (cursor-based, 12 per page)

**2.5 — Access control enforcement**

- Middleware or page-level checks: invite-only potlucks require valid invite code or host identity
- Link-shared potlucks accessible to anyone with the URL but not listed publicly
- Public potlucks: no restrictions

### Deliverable

A guest can find a public potluck on the homepage, claim a need without signing up, and hosts can send invite links for private potlucks.

-----

## 6. Phase 3 — Points & Verification

**Goal:** Hosts can verify contributions and participants earn reputation.

### Tasks

**3.1 — Verification UI (Host)**

- Post-event view on `/p/[slug]/manage`: each claim/offer gets a verify toggle (checkmark button)
- Batch verify: “Verify All” button for quick completion
- Verification triggers point calculation

**3.2 — Points calculation**

- API route: `/api/potlucks/[slug]/verify`
- Accepts array of claim/offer IDs to verify
- Transaction: set `verified = true`, set `points_awarded = need.point_value`, increment `profiles.total_points`
- If points not enabled on potluck, verified flag is still set (for future reputation use) but no points are awarded

**3.3 — Profile page (`/profile`)**

- Display name, avatar, total points
- Potlucks hosted (list with links)
- Potlucks participated in (list with what they brought + points earned)
- Edit profile: update display name, upload avatar

**3.4 — Public profile (`/profile/[id]`)**

- Read-only view: display name, avatar, total points, participation count
- No private data exposed

**3.5 — Guest-to-account migration**

- When a user creates an account, check for claims/offers with matching `guest_email`
- Prompt: “We found contributions linked to your email. Link them to your account?”
- If yes, update `profile_id` on those claims/offers and recalculate points

### Deliverable

Complete potluck lifecycle: create → participate → verify → earn points. Profiles show accumulated reputation.

-----

## 7. Phase 4 — Polish & Launch

**Goal:** Production-ready quality. Delightful to use.

### Tasks

**4.1 — Design system & theming**

- Finalize solarpunk color palette and apply consistently
- Custom emoji picker styling (or use native emoji input with fallback)
- Banner image aspect ratio enforcement (16:9 crop on upload)
- Loading skeletons for all data-fetching states
- Empty states with warm illustrations or copy (e.g., “This potluck needs you!”)
- Toast notifications for actions (claimed, unclaimed, verified)

**4.2 — Mobile optimization**

- Test and fix all touch interactions
- Bottom sheet for claim/offer modals on mobile
- Responsive grid: 1 column mobile, 2 tablet, 3 desktop on homepage
- Tap targets ≥ 44px

**4.3 — SEO & social sharing**

- Dynamic OG images for public potlucks (title + date + banner thumbnail)
- Meta tags on all public pages
- `robots.txt` and `sitemap.xml` for public potlucks

**4.4 — Error handling & edge cases**

- Graceful handling: potluck not found, invite code expired, claim race condition
- Rate limiting on API routes (simple in-memory or Vercel KV)
- Input validation with Zod on all forms and API routes
- 404 and 500 pages with friendly messaging

**4.5 — Notifications**

- Email to host when a need is claimed (batched, max 1 per 15 minutes)
- Email to participant when contribution is verified
- Use Resend or Supabase Edge Functions for sending

**4.6 — Testing & QA**

- End-to-end flow testing (create → share → claim → verify)
- Cross-browser testing (Chrome, Safari, Firefox)
- Lighthouse audit: target 90+ on all scores

### Deliverable

Production-ready Potluck app, deployed and shareable.

-----

## 8. File Structure

```
potluck/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, providers, fonts
│   │   ├── page.tsx                # Homepage (public potluck feed)
│   │   ├── auth/
│   │   │   └── login/page.tsx
│   │   ├── create/
│   │   │   └── page.tsx            # Create potluck form
│   │   ├── p/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx        # Potluck detail (participant view)
│   │   │       └── manage/
│   │   │           └── page.tsx    # Host dashboard
│   │   ├── profile/
│   │   │   ├── page.tsx            # Own profile
│   │   │   └── [id]/page.tsx       # Public profile
│   │   ├── invite/
│   │   │   └── [code]/page.tsx
│   │   └── api/
│   │       ├── potlucks/
│   │       │   ├── route.ts
│   │       │   └── [slug]/
│   │       │       ├── route.ts
│   │       │       ├── verify/route.ts
│   │       │       └── invite/route.ts
│   │       └── upload/
│   │           └── banner/route.ts
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── potluck-card.tsx
│   │   ├── needs-list.tsx
│   │   ├── needs-builder.tsx
│   │   ├── claim-button.tsx
│   │   ├── offer-form.tsx
│   │   ├── emoji-picker.tsx
│   │   ├── banner-upload.tsx
│   │   ├── guest-identity-modal.tsx
│   │   ├── verification-panel.tsx
│   │   └── navbar.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser client
│   │   │   ├── server.ts           # Server client
│   │   │   └── middleware.ts       # Session refresh
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── use-potluck.ts
│   │   ├── use-realtime-claims.ts
│   │   └── use-auth.ts
│   └── types/
│       └── database.ts             # Generated Supabase types
├── supabase/
│   ├── migrations/
│   │   ├── 001_profiles.sql
│   │   ├── 002_potlucks.sql
│   │   ├── 003_needs_claims_offers.sql
│   │   ├── 004_invites.sql
│   │   └── 005_rls_policies.sql
│   └── config.toml
├── public/
│   └── og-default.png
├── middleware.ts
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── .env.local
```

-----

## 9. Development Workflow

**Branching:** Trunk-based. Feature branches off `main`, squash-merge PRs. Vercel preview deploys on every PR.

**Database migrations:** All schema changes via numbered SQL files in `supabase/migrations/`. Apply locally with `supabase db push`, apply to prod via Supabase dashboard or CLI.

**Type generation:** Run `supabase gen types typescript --local > src/types/database.ts` after every migration. Commit the generated file.

**Environment management:** `.env.local` for local dev (gitignored). Vercel environment variables for staging/production. Never commit secrets.

-----

## 10. Launch Checklist

- [ ] Supabase project on paid plan (for production reliability)
- [ ] Custom domain configured on Vercel
- [ ] Email sending configured (Resend or Supabase)
- [ ] Google OAuth redirect URIs updated for production domain
- [ ] RLS policies audited and tested
- [ ] Supabase Storage bucket policies verified
- [ ] Error tracking enabled (Sentry or Vercel Analytics)
- [ ] OG image generation tested
- [ ] Mobile testing on iOS Safari + Android Chrome
- [ ] Lighthouse scores ≥ 90
- [ ] README with setup instructions for contributors

-----

## 11. Risk Register

|Risk                                                            |Likelihood        |Impact|Mitigation                                                                                |
|----------------------------------------------------------------|------------------|------|------------------------------------------------------------------------------------------|
|Claim race conditions (two users claim last item simultaneously)|Medium            |Low   |Postgres transaction + `claimed_quantity` check. UI shows optimistic update with rollback.|
|Guest spam (no account required to claim)                       |Medium            |Medium|Rate limiting by IP on claim/offer endpoints. Host can remove claims.                     |
|Banner image abuse                                              |Low               |Medium|File type validation, size limits. Host is accountable. Future: moderation queue.         |
|Supabase Realtime connection limits                             |Low (at MVP scale)|High  |Monitor connection count. Upgrade Supabase plan if needed. Fallback: polling.             |
|Scope creep into workflow/on-chain features                     |High              |High  |Strict adherence to v1 scope. Maintain “Out of Scope” list. Ship, then iterate.           |
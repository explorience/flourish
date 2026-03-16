# Potluck — Technical Architecture

**Version:** 0.1.0
**Date:** March 16, 2026
**Status:** Draft

-----

## 1. Architecture Overview

Potluck is a single-repo full-stack application deployed on **Vercel** with **Supabase** as the backend-as-a-service layer. The architecture prioritizes simplicity, fast deployment, and low operational overhead.

```
┌─────────────────────────────────────────────┐
│                  Client                      │
│          Next.js (App Router)                │
│     React + Tailwind CSS + shadcn/ui         │
│                                              │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Pages   │  │Components│  │  Hooks      │  │
│  │ (SSR +  │  │ (UI +    │  │ (Supabase   │  │
│  │  CSR)   │  │  Layout) │  │  queries)   │  │
│  └─────────┘  └──────────┘  └────────────┘  │
└──────────────────┬──────────────────────────┘
                   │
          ┌────────┴────────┐
          │  Vercel Edge     │
          │  (API Routes +   │
          │   Middleware)     │
          └────────┬─────────┘
                   │
┌──────────────────┴──────────────────────────┐
│               Supabase                       │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Postgres │ │   Auth   │ │   Storage   │  │
│  │ (+ RLS)  │ │ (Email + │ │  (Banner    │  │
│  │          │ │  Google)  │ │   images)   │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
│  ┌──────────┐ ┌──────────┐                   │
│  │ Realtime │ │  Edge     │                  │
│  │ (claims  │ │ Functions │                  │
│  │  updates)│ │ (future)  │                  │
│  └──────────┘ └──────────┘                   │
└──────────────────────────────────────────────┘
```

-----

## 2. Tech Stack

|Layer           |Technology              |Rationale                                                                                       |
|----------------|------------------------|------------------------------------------------------------------------------------------------|
|**Framework**   |Next.js 14+ (App Router)|SSR for public pages (SEO), CSR for interactive dashboards. Deploys natively on Vercel.         |
|**Language**    |TypeScript              |Type safety across frontend and backend.                                                        |
|**Styling**     |Tailwind CSS + shadcn/ui|Utility-first CSS with accessible, composable components. Easy to theme for solarpunk aesthetic.|
|**Database**    |Supabase Postgres       |Managed Postgres with row-level security, realtime subscriptions, and built-in auth.            |
|**Auth**        |Supabase Auth           |Email/password + Google OAuth. Handles sessions, tokens, and user management.                   |
|**File Storage**|Supabase Storage        |Banner image uploads with public bucket + CDN.                                                  |
|**Realtime**    |Supabase Realtime       |Websocket subscriptions for live claim/offer updates on potluck pages.                          |
|**Deployment**  |Vercel                  |Zero-config Next.js deployment. Preview deploys on PRs.                                         |
|**ORM / Query** |Supabase JS Client      |Direct client-side and server-side queries with type generation via `supabase gen types`.       |

-----

## 3. Database Schema

### 3.1 Entity-Relationship Summary

```
profiles ──┬── potlucks ──┬── needs ──── claims
            │              ├── offers
            │              ├── invites
            │              └── participants
            └── claims (via participant)
```

### 3.2 Tables

#### `profiles`

Extends Supabase Auth users with application data.

|Column        |Type       |Notes                                 |
|--------------|-----------|--------------------------------------|
|`id`          |uuid (PK)  |References `auth.users.id`            |
|`display_name`|text       |Required                              |
|`avatar_url`  |text       |Nullable                              |
|`total_points`|integer    |Default 0, denormalized for fast reads|
|`created_at`  |timestamptz|                                      |
|`updated_at`  |timestamptz|                                      |

#### `potlucks`

|Column          |Type                |Notes                                     |
|----------------|--------------------|------------------------------------------|
|`id`            |uuid (PK)           |                                          |
|`host_id`       |uuid (FK → profiles)|                                          |
|`title`         |text                |Max 100 chars                             |
|`description`   |text                |Max 500 chars                             |
|`event_date`    |timestamptz         |                                          |
|`location`      |text                |Free text                                 |
|`access_level`  |enum                |`invite_only`, `link_shared`, `public`    |
|`open_offers`   |boolean             |Default true                              |
|`points_enabled`|boolean             |Default false                             |
|`banner_url`    |text                |Nullable, Supabase Storage URL            |
|`slug`          |text (unique)       |URL-friendly identifier, auto-generated   |
|`status`        |enum                |`draft`, `active`, `completed`, `archived`|
|`created_at`    |timestamptz         |                                          |
|`updated_at`    |timestamptz         |                                          |

#### `needs`

|Column            |Type                |Notes                           |
|------------------|--------------------|--------------------------------|
|`id`              |uuid (PK)           |                                |
|`potluck_id`      |uuid (FK → potlucks)|                                |
|`emoji`           |text                |Single emoji character          |
|`name`            |text                |                                |
|`quantity`        |integer             |Default 1                       |
|`claimed_quantity`|integer             |Default 0                       |
|`point_value`     |integer             |Nullable, only if points enabled|
|`sort_order`      |integer             |For drag-and-drop reordering    |
|`created_at`      |timestamptz         |                                |

#### `claims`

|Column          |Type                |Notes                                            |
|----------------|--------------------|-------------------------------------------------|
|`id`            |uuid (PK)           |                                                 |
|`need_id`       |uuid (FK → needs)   |                                                 |
|`potluck_id`    |uuid (FK → potlucks)|Denormalized for easier queries                  |
|`profile_id`    |uuid (FK → profiles)|Nullable (null for guests)                       |
|`guest_name`    |text                |Used when profile_id is null                     |
|`guest_email`   |text                |Nullable, for guest follow-up                    |
|`quantity`      |integer             |How many of the need they’re claiming (default 1)|
|`verified`      |boolean             |Default false, set by host post-event            |
|`points_awarded`|integer             |Default 0, set when verified                     |
|`created_at`    |timestamptz         |                                                 |

**Constraint:** `CHECK (profile_id IS NOT NULL OR guest_name IS NOT NULL)` — every claim must have an identity.

#### `offers`

Open offers (not tied to a predefined need).

|Column          |Type                |Notes        |
|----------------|--------------------|-------------|
|`id`            |uuid (PK)           |             |
|`potluck_id`    |uuid (FK → potlucks)|             |
|`profile_id`    |uuid (FK → profiles)|Nullable     |
|`guest_name`    |text                |             |
|`emoji`         |text                |             |
|`name`          |text                |             |
|`description`   |text                |Nullable     |
|`verified`      |boolean             |Default false|
|`points_awarded`|integer             |Default 0    |
|`created_at`    |timestamptz         |             |

#### `invites`

For invite-only potlucks.

|Column      |Type                |Notes                 |
|------------|--------------------|----------------------|
|`id`        |uuid (PK)           |                      |
|`potluck_id`|uuid (FK → potlucks)|                      |
|`email`     |text                |                      |
|`code`      |text (unique)       |Single-use invite code|
|`accepted`  |boolean             |Default false         |
|`created_at`|timestamptz         |                      |

### 3.3 Row-Level Security Policies

|Table     |Policy               |Rule                                                                   |
|----------|---------------------|-----------------------------------------------------------------------|
|`potlucks`|Public read          |`access_level = 'public'` OR user is host OR user has valid invite/link|
|`potlucks`|Insert               |Authenticated users only                                               |
|`potlucks`|Update/Delete        |Host only (`host_id = auth.uid()`)                                     |
|`needs`   |Read                 |Same as parent potluck access                                          |
|`needs`   |Insert/Update/Delete |Host only                                                              |
|`claims`  |Read                 |Same as parent potluck access                                          |
|`claims`  |Insert               |Anyone with potluck access (including anon with guest_name)            |
|`claims`  |Delete               |Claim owner or host                                                    |
|`claims`  |Update (verified)    |Host only                                                              |
|`offers`  |Read                 |Same as parent potluck access                                          |
|`offers`  |Insert               |Anyone with potluck access (if `open_offers = true`)                   |
|`profiles`|Read own             |`id = auth.uid()`                                                      |
|`profiles`|Public read (limited)|`display_name` and `total_points` only                                 |

-----

## 4. API Design

The app uses a combination of direct Supabase client queries (for simple CRUD) and Next.js API routes (for operations requiring server-side logic).

### 4.1 Direct Supabase Client (Client-Side)

Most read operations and simple mutations go directly through the Supabase JS client, protected by RLS.

- Fetch potluck details and needs
- Create/delete claims
- Create offers
- Fetch public potluck list
- Profile reads

### 4.2 Next.js API Routes (Server-Side)

Used when business logic, validation, or privileged operations are needed.

|Route                        |Method|Purpose                                                  |
|-----------------------------|------|---------------------------------------------------------|
|`/api/potlucks`              |POST  |Create potluck (validate, generate slug, create needs)   |
|`/api/potlucks/[slug]`       |PATCH |Update potluck details                                   |
|`/api/potlucks/[slug]/verify`|POST  |Batch verify contributions + award points (transactional)|
|`/api/potlucks/[slug]/invite`|POST  |Generate invite codes, send invite emails                |
|`/api/upload/banner`         |POST  |Handle banner image upload to Supabase Storage           |
|`/api/auth/callback`         |GET   |OAuth callback handler                                   |

### 4.3 Realtime Subscriptions

Subscribe to changes on `claims` and `offers` filtered by `potluck_id` so all participants see live updates when someone claims a need or adds an offer.

```typescript
supabase
  .channel(`potluck:${potluckId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'claims',
    filter: `potluck_id=eq.${potluckId}`
  }, handleClaimChange)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'offers',
    filter: `potluck_id=eq.${potluckId}`
  }, handleOfferChange)
  .subscribe()
```

-----

## 5. Authentication Flow

```
Guest Flow:
  Visit potluck → See needs → Tap "Claim" →
  Prompted for display name → Claim created with guest_name →
  Soft prompt: "Create an account to earn points"

Authenticated Flow:
  Sign up (email or Google) → Profile auto-created via DB trigger →
  Full access: host potlucks, earn points, view history
```

Supabase Auth handles session management. The app uses `@supabase/ssr` for server-side session handling in Next.js middleware.

**Middleware** (`middleware.ts`): Refreshes session on every request. Protects `/create` and `/dashboard` routes (require auth). Passes session to server components.

-----

## 6. File Storage

Banner images are stored in a Supabase Storage bucket named `banners`.

- **Upload flow:** Client-side presigned upload via Supabase Storage API → store returned public URL in `potlucks.banner_url`.
- **Constraints:** Max 5MB, JPEG/PNG/WebP only. Images served via Supabase CDN.
- **Naming convention:** `banners/{potluck_id}/{timestamp}.{ext}` — avoids collisions.

-----

## 7. Page Structure

|Route             |Access       |Rendering|Description                                   |
|------------------|-------------|---------|----------------------------------------------|
|`/`               |Public       |SSR      |Homepage — public potluck feed                |
|`/p/[slug]`       |Conditional  |SSR + CSR|Potluck detail page (participant view)        |
|`/create`         |Auth required|CSR      |Create a new potluck                          |
|`/p/[slug]/manage`|Host only    |CSR      |Host dashboard with verification controls     |
|`/profile`        |Auth required|CSR      |User profile, points history, potluck history |
|`/profile/[id]`   |Public       |SSR      |Public profile (name + points + participation)|
|`/auth/login`     |Public       |CSR      |Login / sign-up page                          |
|`/invite/[code]`  |Public       |SSR      |Invite code landing → redirects to potluck    |

-----

## 8. Key Technical Decisions

**Why Supabase over custom backend?** Supabase gives us Postgres, auth, storage, and realtime out of the box. For an MVP of this scope, a custom backend would be over-engineering. RLS provides security at the data layer without writing auth middleware.

**Why Next.js App Router?** Server components for SEO-critical pages (public potlucks, profiles). Client components for interactive features (claim buttons, realtime updates). API routes for server-side logic. All in one repo, deploys to Vercel in one click.

**Why not a separate API service?** The app is a single module. Keeping everything in one Next.js repo means one deployment target, one set of environment variables, and zero infrastructure management beyond Vercel + Supabase.

**Guest participation strategy:** Claims and offers have both a `profile_id` and a `guest_name` field. This avoids forcing account creation while allowing logged-in users to accumulate reputation. If a guest later creates an account, a migration function can retroactively link claims by matching email.

-----

## 9. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Server-side only
NEXT_PUBLIC_APP_URL=https://potluck.app  # For invite links, OG tags
```

-----

## 10. Future Architecture Considerations

These are explicitly out of scope for v1 but inform current decisions:

- **On-chain attestations:** The `verified` boolean on claims is designed to be replaceable with an on-chain attestation reference (e.g., EAS attestation UID). The points system maps cleanly to attestation-based reputation.
- **Workflow management:** The `status` field on potlucks (`draft` → `active` → `completed` → `archived`) provides the state machine hook for future workflow features.
- **Federation / coordination stack:** The slug-based URL scheme and clean API boundaries make Potluck embeddable as a module in a larger platform.
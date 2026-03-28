# Flourish

**A free community exchange board for London, Ontario.**

> Share what you have. Ask for what you need.

Flourish is a mutual aid platform where neighbours can post what they need or what they can offer — items, services, skills, or space. No selling, no algorithms, no ads. Just people helping each other.

---

## Features

- **Post needs and offers** — items, services, skills, space
- **Browse without an account** — open by default
- **Magic link login** — just an email, no passwords
- **SMS posting** — text to post if you don't have email
- **Private messaging** — connect through the app without exposing your contact info
- **Real-time feed** — new posts appear instantly via Supabase Realtime
- **Map view** — see posts by neighbourhood
- **Auto-expiry** — posts expire after 30 days to keep the board fresh
- **Moderation system** — admin dashboard for community moderators
- **Mobile-first** — works well on any device

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL + Realtime) |
| Auth | Supabase Auth (magic links) |
| Email | Brevo (transactional) |
| Styling | Tailwind CSS + CSS variables |
| Deployment | Vercel |
| Maps | Leaflet (OpenStreetMap) |

---

## Local Development

### Prerequisites

- Node.js 18+
- A Supabase project ([supabase.com](https://supabase.com))
- A Brevo account for transactional email (optional for local dev)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-org/flourish.git
cd flourish

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Fill in your env vars (see below)
nano .env.local

# 5. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file in the project root with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Brevo (transactional email)
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=noreply@yourdomain.com
BREVO_FROM_NAME=Flourish

# SMS (optional — Twilio or similar)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

The `SUPABASE_SERVICE_ROLE_KEY` is used server-side only for admin operations. Never expose it to the client.

---

## Database Setup

Run the SQL in `SUPABASE_MIGRATION.sql` in your Supabase SQL editor. This creates:

- `moderators` table with RLS
- `moderation_log` table
- Moderation columns on the `posts` table (`moderation_status`, `moderated_by`, `moderated_at`, `rejection_reason`)
- Seeds the first admin moderator

The base schema (posts, responses, threads, messages) should already exist if you set up Supabase first.

---

## Deployment

Flourish is designed to deploy on [Vercel](https://vercel.com).

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy
```

Or connect your GitHub repo to Vercel for automatic deployments on push.

**Environment variables** must be added in the Vercel project dashboard under Settings → Environment Variables.

---

## Project Structure

```
src/
  app/                   # Next.js App Router pages
    page.tsx             # Main feed
    about/               # About page
    admin/               # Moderation dashboard
    api/                 # API routes
      feedback/          # Feedback email endpoint
      admin/             # Admin/moderation endpoints
    auth/                # Authentication
    messages/            # Private messaging
    post/[id]/           # Individual post detail
  components/            # Shared React components
    header.tsx           # Site header
    post-card.tsx        # Post card (with moderation bar)
    post-feed.tsx        # Feed with filters
  lib/
    supabase/            # Supabase client helpers
    admin.ts             # Moderator auth helpers
    email.ts             # Brevo email templates
    constants.ts         # App-wide constants
  types/
    database.ts          # TypeScript types
public/
  docs/
    moderator-guide.md   # Guide for community moderators
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to get involved.

---

## License

MIT — see [LICENSE](./LICENSE).

Copyright 2026 Flourish Contributors.

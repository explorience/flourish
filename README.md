# Potluck

A lightweight coordination tool for shared meals and gatherings. Create a potluck, share it with your people, and let everyone claim what to bring.

**Live at [potluck.exchange](https://www.potluck.exchange)**

## Features

- **Create & share potlucks** — set a title, date, location, banner image, and list what you need
- **Claim items** — guests pick what to bring so nothing gets doubled (or forgotten)
- **Open offers** — optionally let guests volunteer items not on the list
- **Access control** — public (listed on homepage), link-shared, or invite-only with email invites
- **RSVP tracking** — see who's coming at a glance
- **Add to calendar** — one-click Google Calendar or .ics download (Apple Calendar, Outlook, etc.)
- **Get directions** — smart address detection with Google Maps / Apple Maps links
- **Potluck Points** — optional reputation system where hosts verify contributions
- **Guest-friendly** — no account required to claim items or RSVP
- **Real-time updates** — claims, offers, and RSVPs update live via Supabase Realtime
- **OG images** — auto-generated social preview cards for every potluck
- **Mobile-first** — responsive design that works great on any device

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org) (App Router)
- **Database & Auth:** [Supabase](https://supabase.com) (Postgres, Auth, Storage, Realtime)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Email:** [Resend](https://resend.com) (invite emails)
- **Hosting:** [Vercel](https://vercel.com)
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- (Optional) A [Resend](https://resend.com) API key for invite emails

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/potluck.git
cd potluck
npm install
```

### 2. Set up Supabase

Create a new Supabase project and run the migration SQL in `supabase/` to set up the schema (tables for `profiles`, `potlucks`, `needs`, `claims`, `offers`, `invites`, `rsvps` and Row Level Security policies).

### 3. Configure environment variables

Copy the example and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=your-resend-key          # optional, for invite emails
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes (potluck CRUD, file uploads)
│   ├── auth/             # Login page + OAuth callback
│   ├── create/           # Create potluck form
│   ├── invite/[code]/    # Invite acceptance flow
│   ├── p/[slug]/         # Potluck detail + host manage page
│   ├── profile/          # User profile + avatar upload
│   ├── layout.tsx        # Root layout (font, navbar, toaster)
│   └── page.tsx          # Homepage (hero, my potlucks, public feed)
├── components/           # Shared UI (cards, forms, modals, shadcn/ui)
├── hooks/                # Custom hooks (auth, realtime subscriptions)
├── lib/                  # Supabase clients, utilities
└── types/                # TypeScript types (database schema)
```

## Deployment

The app deploys to Vercel with zero config. Connect your repo, add the environment variables above, and deploy.

## License

MIT

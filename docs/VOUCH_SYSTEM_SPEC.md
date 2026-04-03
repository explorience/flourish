# Vouch System Technical Specification
## Flourish Community Exchange - TrustGraph + WaaP Integration

### Overview

A trust-based onboarding system where existing community members vouch for new members. Under the hood, vouches are recorded as EAS attestations via TrustGraph on Optimism, with WaaP (Wallet as a Protocol) providing invisible wallet management.

Users never see wallets, chains, gas, or signing prompts. They see: "Sarah vouched for you."

### Architecture

```
┌─────────────────────────────────────────────────┐
│                  Flourish App                     │
│  (Next.js 14 + Supabase + Tailwind)              │
│                                                   │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Supabase  │  │  WaaP    │  │ TrustGraph   │  │
│  │ Auth +    │  │  SDK     │  │ Ponder API   │  │
│  │ Profiles  │  │ (wallet) │  │ (read scores)│  │
│  └─────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│        │              │               │           │
└────────┼──────────────┼───────────────┼───────────┘
         │              │               │
         │         ┌────▼─────┐   ┌─────▼──────┐
         │         │  Human   │   │  Optimism  │
         │         │  Network │   │  EAS       │
         │         │  (2PC)   │   │  Contract  │
         │         └──────────┘   └────────────┘
         │
    ┌────▼─────┐
    │ Supabase │
    │ Database │
    └──────────┘
```

### Key Design Decisions

1. **WaaP over WaaS**: Self-custodied wallets via 2PC (no vendor lock-in, no recurring fees, user owns their keys)
2. **TrustGraph on Optimism**: Production deployment at `trust-graph.wavs.xyz`, EAS at `0x4200000000000000000000000000000000000021`
3. **Email-first auth**: Users sign in with email (Supabase magic link). WaaP wallet created silently on first vouch interaction.
4. **Gas abstraction**: WaaP Gas Tank sponsors transactions so users never need ETH
5. **Progressive disclosure**: Users start with Supabase auth only. WaaP wallet activates when they vouch or get vouched.

### Data Flow

#### User Registration
1. User signs up via Supabase magic link (existing flow)
2. Profile created in `profiles` table (existing)
3. Status: `unvouched` (can browse, cannot post)
4. No wallet created yet

#### Getting Vouched
1. Existing member clicks "Vouch for [name]" on someone's profile
2. App checks if voucher has WaaP wallet → if not, creates one (email-based, invisible)
3. App creates EAS attestation on Optimism via TrustGraph schema:
   - Schema: `bytes32 vouchId, address recipient, string context`
   - Signed by voucher's WaaP wallet
   - Gas sponsored via WaaP Gas Tank
4. Supabase `vouches` table updated (local cache for fast reads)
5. Recipient's status changes to `vouched` → can now post

#### Viewing Trust
1. Trust scores fetched from TrustGraph Ponder API (`trust-graph.wavs.xyz/ponder`)
2. Displayed as a simple indicator on profiles (not a number - just "trusted" / "new" / "well-connected")
3. Number of vouches shown on profile

### Database Schema

```sql
-- Migration: 013_vouches.sql

-- Vouch status on profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS vouch_status text NOT NULL DEFAULT 'unvouched'
    CHECK (vouch_status IN ('unvouched', 'vouched', 'voucher')),
  ADD COLUMN IF NOT EXISTS wallet_address text,
  ADD COLUMN IF NOT EXISTS vouch_count integer NOT NULL DEFAULT 0;

-- Vouches table (local cache of on-chain attestations)
CREATE TABLE IF NOT EXISTS public.vouches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  vouchee_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  attestation_uid text, -- EAS attestation UID (null until on-chain)
  tx_hash text,         -- Transaction hash
  context text,         -- Optional note: "I know them from the repair cafe"
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(voucher_id, vouchee_id)
);

ALTER TABLE public.vouches ENABLE ROW LEVEL SECURITY;

-- Anyone can read vouches
CREATE POLICY "Vouches are viewable by everyone" 
  ON public.vouches FOR SELECT USING (true);

-- Authenticated users can create vouches
CREATE POLICY "Authenticated users can vouch"
  ON public.vouches FOR INSERT 
  WITH CHECK (auth.uid() = voucher_id);

-- Only voucher can update their vouch
CREATE POLICY "Vouchers can update their vouches"
  ON public.vouches FOR UPDATE
  USING (auth.uid() = voucher_id);

-- Invite links for vouching
CREATE TABLE IF NOT EXISTS public.vouch_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  voucher_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  max_uses integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vouch_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invites viewable by creator"
  ON public.vouch_invites FOR SELECT
  USING (auth.uid() = voucher_id);

CREATE POLICY "Authenticated users can create invites"
  ON public.vouch_invites FOR INSERT
  WITH CHECK (auth.uid() = voucher_id);

CREATE POLICY "Anyone can read invite by code"
  ON public.vouch_invites FOR SELECT
  USING (true);
```

### New Dependencies

```json
{
  "@human.tech/waap-sdk": "^1.2.0",
  "@ethereum-attestation-service/eas-sdk": "^2.9.0",
  "viem": "^2.37.9"
}
```

Note: wagmi is NOT needed. Flourish uses Supabase auth, not wallet-based auth. We use the WaaP SDK directly (not via wagmi connector) to create wallets and sign attestations server-side or in minimal client-side flows.

### API Routes

#### POST /api/vouch
Creates a vouch attestation.

```typescript
// Request
{
  voucheeId: string,    // Supabase user ID of person being vouched
  context?: string       // Optional note
}

// Response  
{
  ok: true,
  vouchId: string,
  attestationUid?: string,  // Set after on-chain confirmation
  txHash?: string
}
```

Flow:
1. Verify caller is authenticated and has `vouched` or `voucher` status
2. Check vouchee exists and is `unvouched`
3. Check no existing vouch from this voucher to this vouchee
4. Create local vouch record (status: pending)
5. If voucher has no WaaP wallet: create one via `initWaaP()`, store address
6. Create EAS attestation on Optimism via WaaP-signed transaction
7. Update vouch record with attestation UID and tx hash
8. Update vouchee's `vouch_status` to `vouched`, increment `vouch_count`
9. Send notification email to vouchee

#### POST /api/vouch/invite
Creates a shareable invite link.

```typescript
// Request
{ maxUses?: number, expiresInDays?: number }

// Response
{ ok: true, code: string, link: string }
```

#### POST /api/vouch/redeem
Redeems an invite code (triggers vouch).

```typescript
// Request
{ code: string }

// Response
{ ok: true, vouched: true }
```

#### GET /api/trust/[userId]
Fetches trust info for a user.

```typescript
// Response
{
  vouchCount: number,
  vouchedBy: { name: string, neighbourhood?: string }[],
  trustLevel: 'new' | 'vouched' | 'trusted' | 'well-connected',
  memberSince: string
}
```

### UI Components

#### 1. Vouch Gate (Post Creation)
- If user is `unvouched`: show "You need a vouch from an existing member to post. Ask someone in the community to vouch for you, or use an invite link."
- Include "I have an invite code" button → opens code entry form
- Browsing the board remains open to everyone

#### 2. Vouch Button (Profile Page)
- Shown on other users' profiles when viewer is vouched/voucher
- "Vouch for [Name]" button with optional context field
- Confirmation: "You're vouching that you know [Name] and trust them in the community"
- After vouch: shows "You vouched for [Name]" with timestamp

#### 3. Trust Badge (Post Cards + Profile)
- Small indicator showing vouch status
- Styles: leaf icon (🌿 via CSS, not emoji) for vouched members
- Vouch count shown on profile page
- "Vouched by: Sarah, Marcus, ..." list on profile

#### 4. Invite Link Generator (Account Page)
- "Invite someone" section
- Generates shareable link: `flourish.example.com/join?invite=abc123`
- Shows active invites with usage stats

### Access Control Matrix

| Action | Unvouched | Vouched | Voucher (founding) |
|--------|-----------|---------|---------------------|
| Browse board | ✅ | ✅ | ✅ |
| View post details | ✅ | ✅ | ✅ |
| Respond to posts | ❌ | ✅ | ✅ |
| Create posts | ❌ | ✅ | ✅ |
| Vouch for others | ❌ | ✅ | ✅ |
| Create invites | ❌ | ✅ | ✅ |
| View trust scores | ✅ | ✅ | ✅ |

### Founding Members

For the pilot launch, existing members need `voucher` status without being vouched themselves:

```sql
-- Set founding members (run once at launch)
-- These are people in the organizing committee
UPDATE profiles SET vouch_status = 'voucher' WHERE id IN (
  -- Add founding member IDs here
);
```

Or via an admin API route protected by a secret.

### WaaP Integration Details

**SDK**: `@human.tech/waap-sdk` v1.2.0+

**Initialization** (client-side, lazy):
```typescript
import { initWaaP } from '@human.tech/waap-sdk';

const waap = initWaaP({
  config: {
    authenticationMethods: ['email'],
    styles: { darkMode: true }
  },
  project: {
    name: 'Flourish',
    entryTitle: 'Connect to vouch'
  }
});
```

**Key point**: WaaP wallet creation is deferred until first vouch action. Most users will never interact with WaaP directly - the wallet is created silently when they vouch for someone, and the attestation is signed automatically.

### TrustGraph Integration Details

**API Endpoint**: `https://trust-graph.wavs.xyz/ponder`
**Chain**: Optimism (chain ID 10)
**EAS Contract**: `0x4200000000000000000000000000000000000021`
**Schema Registry**: `0x4200000000000000000000000000000000000020`

**Schema for vouches** (to be registered):
```
bytes32 communityId, address recipient, uint256 weight, string context
```

Where:
- `communityId`: keccak256("flourish") - identifies our community
- `recipient`: vouchee's WaaP wallet address
- `weight`: 100 (standard vouch)
- `context`: optional note from voucher

**Reading trust scores**: Query the Ponder API for attestations with our schema UID and community ID.

### Phase 1 (MVP - what we're building now)

1. ✅ Database schema (vouches, vouch_invites, profile fields)
2. ✅ Vouch gate on post creation
3. ✅ Vouch button on profiles
4. ✅ Invite link system
5. ✅ Trust badges on post cards
6. ✅ Local vouch tracking in Supabase
7. ⬜ WaaP wallet creation (deferred - uses Supabase-only vouching first)
8. ⬜ EAS attestation creation (deferred - local-first, on-chain later)
9. ⬜ TrustGraph score reading (deferred)

**Rationale**: Ship the UX first with local-only vouching. Wire up the on-chain layer after the pilot validates the social dynamics. This means founding members can start vouching immediately without needing Optimism gas or WaaP setup.

### Phase 2 (On-chain)

1. WaaP wallet creation on first vouch
2. EAS attestation for each vouch
3. TrustGraph PageRank scores
4. Gas Tank sponsorship setup
5. Portable trust (vouches work across TrustGraph communities)

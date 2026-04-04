-- Vouch system: trust-based onboarding

-- Add vouch fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS vouch_status text NOT NULL DEFAULT 'unvouched'
    CHECK (vouch_status IN ('unvouched', 'vouched', 'voucher')),
  ADD COLUMN IF NOT EXISTS wallet_address text,
  ADD COLUMN IF NOT EXISTS vouch_count integer NOT NULL DEFAULT 0;

-- Vouches table (local cache, on-chain attestations wired in Phase 2)
CREATE TABLE IF NOT EXISTS public.vouches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  vouchee_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  attestation_uid text,
  tx_hash text,
  context text,
  status text NOT NULL DEFAULT 'confirmed' 
    CHECK (status IN ('pending', 'confirmed', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(voucher_id, vouchee_id)
);

ALTER TABLE public.vouches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vouches are viewable by everyone" 
  ON public.vouches FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vouch"
  ON public.vouches FOR INSERT 
  WITH CHECK (auth.uid() = voucher_id);

CREATE POLICY "Vouchers can update their vouches"
  ON public.vouches FOR UPDATE
  USING (auth.uid() = voucher_id);

-- Invite links for vouching
CREATE TABLE IF NOT EXISTS public.vouch_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  voucher_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  max_uses integer NOT NULL DEFAULT 3,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vouch_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read invites"
  ON public.vouch_invites FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create invites"
  ON public.vouch_invites FOR INSERT
  WITH CHECK (auth.uid() = voucher_id);

CREATE POLICY "Creators can update invites"
  ON public.vouch_invites FOR UPDATE
  USING (auth.uid() = voucher_id);

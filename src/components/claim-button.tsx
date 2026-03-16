"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  GuestIdentityModal,
  getStoredGuestIdentity,
} from "@/components/guest-identity-modal";
import { Check, Minus } from "lucide-react";
import { toast } from "sonner";
import type { NeedWithClaims } from "@/types/database";

interface ClaimButtonProps {
  need: NeedWithClaims;
  potluckId: string;
  onClaimed?: () => void;
}

export function ClaimButton({ need, potluckId, onClaimed }: ClaimButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const supabase = createClient();

  const userClaim = need.claims.find(
    (c) =>
      (user && c.profile_id === user.id) ||
      (!user &&
        c.guest_name &&
        c.guest_name === getStoredGuestIdentity()?.name)
  );

  const isFull = need.claimed_quantity >= need.quantity;

  const handleClaim = async (guestName?: string, guestEmail?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("claims").insert({
        need_id: need.id,
        potluck_id: potluckId,
        profile_id: user?.id || null,
        guest_name: guestName || null,
        guest_email: guestEmail || null,
        quantity: 1,
      });

      if (error) throw error;
      toast.success(`Claimed: ${need.emoji} ${need.name}`);
      onClaimed?.();
    } catch (err) {
      toast.error("Failed to claim. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnclaim = async () => {
    if (!userClaim) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("claims")
        .delete()
        .eq("id", userClaim.id);

      if (error) throw error;
      toast.success(`Unclaimed: ${need.emoji} ${need.name}`);
      onClaimed?.();
    } catch (err) {
      toast.error("Failed to unclaim. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (userClaim) {
      handleUnclaim();
      return;
    }

    if (!user) {
      const stored = getStoredGuestIdentity();
      if (stored) {
        handleClaim(stored.name, stored.email);
      } else {
        setShowGuestModal(true);
      }
      return;
    }

    handleClaim();
  };

  if (userClaim) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={loading}
        className="border-warm-green text-warm-green hover:bg-warm-green/10"
      >
        <Check className="mr-1.5 h-3.5 w-3.5" />
        Claimed
      </Button>
    );
  }

  return (
    <>
      <Button
        size="sm"
        onClick={handleClick}
        disabled={loading || isFull}
        className={isFull ? "opacity-50" : ""}
      >
        {isFull ? "Full" : "Claim"}
      </Button>
      <GuestIdentityModal
        open={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSubmit={(name, email) => {
          setShowGuestModal(false);
          handleClaim(name, email);
        }}
      />
    </>
  );
}

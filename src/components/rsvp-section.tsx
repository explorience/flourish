"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GuestIdentityModal,
  getStoredGuestIdentity,
} from "@/components/guest-identity-modal";
import { UserCheck, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import type { RsvpWithProfile } from "@/types/database";

interface RsvpSectionProps {
  potluckId: string;
  rsvps: RsvpWithProfile[];
  onRsvpChanged?: () => void;
}

export function RsvpSection({
  potluckId,
  rsvps,
  onRsvpChanged,
}: RsvpSectionProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const supabase = createClient();

  const userRsvp = useMemo(() => {
    if (user) return rsvps.find((r) => r.profile_id === user.id);
    const stored = getStoredGuestIdentity();
    if (stored) return rsvps.find((r) => r.guest_name === stored.name);
    return undefined;
  }, [rsvps, user]);

  const handleRsvp = async (guestName?: string, guestEmail?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("rsvps").insert({
        potluck_id: potluckId,
        profile_id: user?.id || null,
        guest_name: guestName || null,
        guest_email: guestEmail || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.info("You've already RSVP'd!");
        } else {
          throw error;
        }
      } else {
        toast.success("You're going! 🎉");
      }
      onRsvpChanged?.();
    } catch {
      toast.error("Failed to RSVP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!userRsvp) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("rsvps")
        .delete()
        .eq("id", userRsvp.id);

      if (error) throw error;
      toast.success("RSVP cancelled.");
      onRsvpChanged?.();
    } catch {
      toast.error("Failed to cancel RSVP.");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (userRsvp) {
      handleCancel();
      return;
    }
    if (!user) {
      const stored = getStoredGuestIdentity();
      if (stored) {
        handleRsvp(stored.name, stored.email);
      } else {
        setShowGuestModal(true);
      }
      return;
    }
    handleRsvp();
  };

  const displayName = (rsvp: RsvpWithProfile) =>
    rsvp.profile?.display_name || rsvp.guest_name || "Guest";

  const initial = (rsvp: RsvpWithProfile) => {
    const name = displayName(rsvp);
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-warm-green" />
          <h3 className="font-semibold text-lg">
            Attending
            {rsvps.length > 0 && (
              <span className="text-muted-foreground font-normal ml-1.5 text-base">
                ({rsvps.length})
              </span>
            )}
          </h3>
        </div>
        {userRsvp ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={loading}
            className="border-warm-green text-warm-green hover:bg-warm-green/10"
          >
            <UserCheck className="mr-1.5 h-3.5 w-3.5" />
            Going
          </Button>
        ) : (
          <Button size="sm" onClick={handleClick} disabled={loading}>
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            RSVP
          </Button>
        )}
      </div>

      {rsvps.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {rsvps.map((rsvp) => (
            <div
              key={rsvp.id}
              className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-card"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={rsvp.profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-warm-green/10 text-warm-green">
                  {initial(rsvp)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate">
                {displayName(rsvp)}
              </span>
            </div>
          ))}
        </div>
      )}

      {rsvps.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No RSVPs yet — be the first to say you&apos;re going!
        </p>
      )}

      <GuestIdentityModal
        open={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSubmit={(name, email) => {
          setShowGuestModal(false);
          handleRsvp(name, email);
        }}
      />
    </div>
  );
}

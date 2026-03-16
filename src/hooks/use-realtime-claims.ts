"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Claim, Offer, NeedWithClaims, Need } from "@/types/database";

export function useRealtimeClaims(potluckId: string, initialNeeds: NeedWithClaims[]) {
  const [needs, setNeeds] = useState<NeedWithClaims[]>(initialNeeds);
  const supabase = createClient();

  const refetchNeeds = useCallback(async () => {
    const { data: needsData } = await supabase
      .from("needs")
      .select("*, claims(*)")
      .eq("potluck_id", potluckId)
      .order("sort_order");

    if (needsData) {
      setNeeds(needsData as NeedWithClaims[]);
    }
  }, [supabase, potluckId]);

  useEffect(() => {
    setNeeds(initialNeeds);
  }, [initialNeeds]);

  useEffect(() => {
    const channel = supabase
      .channel(`potluck:${potluckId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "claims",
          filter: `potluck_id=eq.${potluckId}`,
        },
        () => {
          refetchNeeds();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "needs",
          filter: `potluck_id=eq.${potluckId}`,
        },
        () => {
          refetchNeeds();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, potluckId, refetchNeeds]);

  return { needs, refetchNeeds };
}

export function useRealtimeOffers(potluckId: string, initialOffers: Offer[]) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const supabase = createClient();

  const refetchOffers = useCallback(async () => {
    const { data } = await supabase
      .from("offers")
      .select("*")
      .eq("potluck_id", potluckId)
      .order("created_at");

    if (data) {
      setOffers(data);
    }
  }, [supabase, potluckId]);

  useEffect(() => {
    setOffers(initialOffers);
  }, [initialOffers]);

  useEffect(() => {
    const channel = supabase
      .channel(`potluck-offers:${potluckId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offers",
          filter: `potluck_id=eq.${potluckId}`,
        },
        () => {
          refetchOffers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, potluckId, refetchOffers]);

  return { offers, refetchOffers };
}

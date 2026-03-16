"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeClaims, useRealtimeOffers } from "@/hooks/use-realtime-claims";
import { NeedsList } from "@/components/needs-list";
import { VerificationPanel } from "@/components/verification-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Copy,
  ExternalLink,
  Users,
  CheckCircle,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTime, getClaimProgress } from "@/lib/utils";
import type { Potluck, NeedWithClaims, Offer } from "@/types/database";

export default function ManagePotluckPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [potluck, setPotluck] = useState<Potluck | null>(null);
  const [rawNeeds, setRawNeeds] = useState<NeedWithClaims[]>([]);
  const [rawOffers, setRawOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "verify">("overview");

  const { needs, refetchNeeds } = useRealtimeClaims(potluck?.id || "", rawNeeds);
  const { offers, refetchOffers } = useRealtimeOffers(potluck?.id || "", rawOffers);

  const fetchData = useCallback(async () => {
    const { data: potluckData } = await supabase
      .from("potlucks")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!potluckData) {
      router.push("/");
      return;
    }

    setPotluck(potluckData);

    const [needsRes, offersRes] = await Promise.all([
      supabase
        .from("needs")
        .select("*, claims(*)")
        .eq("potluck_id", potluckData.id)
        .order("sort_order"),
      supabase
        .from("offers")
        .select("*")
        .eq("potluck_id", potluckData.id)
        .order("created_at"),
    ]);

    setRawNeeds((needsRes.data as NeedWithClaims[]) || []);
    setRawOffers(offersRes.data || []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, router]);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  useEffect(() => {
    if (!authLoading && !loading && potluck && user?.id !== potluck.host_id) {
      router.push(`/p/${slug}`);
    }
  }, [authLoading, loading, potluck, user, slug, router]);

  const copyLink = () => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const addNeed = async () => {
    if (!potluck) return;
    const { error } = await supabase.from("needs").insert({
      potluck_id: potluck.id,
      emoji: "🍽️",
      name: "New item",
      quantity: 1,
      sort_order: needs.length,
    });
    if (!error) refetchNeeds();
  };

  const deleteNeed = async (needId: string) => {
    const { error } = await supabase.from("needs").delete().eq("id", needId);
    if (!error) refetchNeeds();
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!potluck) return null;

  const progress = getClaimProgress(needs);

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2">
            Host Dashboard
          </Badge>
          <h1 className="text-3xl font-bold">{potluck.title}</h1>
          <p className="text-muted-foreground mt-1">
            {formatDateTime(potluck.event_date)} · {potluck.location}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/p/${slug}`, "_blank")}
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            View
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-warm-green">
              {progress.percentage}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Claimed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{needs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Needs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">
              {new Set(
                needs
                  .flatMap((n) => n.claims)
                  .map((c) => c.profile_id || c.guest_name)
              ).size}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Participants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{offers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Offers</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="inline mr-1.5 h-4 w-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab("verify")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "verify"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle className="inline mr-1.5 h-4 w-4" />
          Verify
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Needs management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Needs</CardTitle>
              <Button variant="outline" size="sm" onClick={addNeed}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Need
              </Button>
            </CardHeader>
            <CardContent>
              <NeedsList
                needs={needs}
                potluckId={potluck.id}
                showClaimButton={false}
              />
            </CardContent>
          </Card>

          {/* Offers */}
          {potluck.open_offers && offers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Open Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <span className="text-xl">{offer.emoji}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{offer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          by {offer.guest_name || "Member"}
                        </p>
                      </div>
                      {offer.verified && (
                        <Badge variant="success">Verified</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "verify" && (
        <Card>
          <CardContent className="p-6">
            <VerificationPanel
              potluckSlug={slug}
              needs={needs}
              offers={offers}
              pointsEnabled={potluck.points_enabled}
              onVerified={() => {
                refetchNeeds();
                refetchOffers();
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

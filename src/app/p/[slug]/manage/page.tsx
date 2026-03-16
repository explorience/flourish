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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  ExternalLink,
  Users,
  CheckCircle,
  Plus,
  Loader2,
  Mail,
  Send,
  Link as LinkIcon,
  Check,
  Clock,
  Trash2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTime, getClaimProgress } from "@/lib/utils";
import type { Potluck, NeedWithClaims, Offer, Invite } from "@/types/database";

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
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "verify" | "invites">("overview");
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvites, setSendingInvites] = useState(false);

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

    const [needsRes, offersRes, invitesRes] = await Promise.all([
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
      supabase
        .from("invites")
        .select("*")
        .eq("potluck_id", potluckData.id)
        .order("created_at", { ascending: false }),
    ]);

    setRawNeeds((needsRes.data as NeedWithClaims[]) || []);
    setRawOffers(offersRes.data || []);
    setInvites(invitesRes.data || []);
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

  const sendInvites = async () => {
    const raw = inviteEmail.trim();
    if (!raw) return;

    const emails = raw
      .split(/[,;\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (emails.length === 0) {
      toast.error("Please enter valid email addresses.");
      return;
    }

    const existing = new Set(invites.map((i) => i.email.toLowerCase()));
    const newEmails = emails.filter((e) => !existing.has(e));
    if (newEmails.length === 0) {
      toast.error("All emails have already been invited.");
      return;
    }

    setSendingInvites(true);
    try {
      const res = await fetch(`/api/potlucks/${slug}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: newEmails }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send invites.");
        return;
      }
      const emailsSent = data.emailsSent || 0;
      if (emailsSent > 0) {
        toast.success(`${emailsSent} invite email(s) sent!`);
      } else {
        toast.success(`${newEmails.length} invite(s) created! Share the links below.`);
      }
      setInviteEmail("");
      fetchData();
    } catch {
      toast.error("Failed to send invites.");
    } finally {
      setSendingInvites(false);
    }
  };

  const copyInviteLink = (code: string) => {
    const url = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Invite link copied!");
  };

  const shareInvite = (invite: Invite) => {
    const link = `${window.location.origin}/invite/${invite.code}`;
    const subject = encodeURIComponent(`You're invited to ${potluck?.title || "a Potluck"}!`);
    const body = encodeURIComponent(
      `Hey! You're invited to "${potluck?.title}".\n\n` +
      `📅 ${potluck ? formatDateTime(potluck.event_date) : ""}\n` +
      `📍 ${potluck?.location || ""}\n\n` +
      `Join here: ${link}`
    );
    window.open(`mailto:${invite.email}?subject=${subject}&body=${body}`);
  };

  const deleteInvite = async (inviteId: string) => {
    const { error } = await supabase.from("invites").delete().eq("id", inviteId);
    if (!error) {
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      toast.success("Invite removed.");
    }
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
    <div className="container max-w-4xl py-6 md:py-8 space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <Badge variant="outline" className="mb-2">
            Host Dashboard
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{potluck.title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {formatDateTime(potluck.event_date)} · {potluck.location}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copy Link</span>
            <span className="sm:hidden">Copy</span>
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
        <button
          onClick={() => setActiveTab("invites")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "invites"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="inline mr-1.5 h-4 w-4" />
          Invites
          {invites.length > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
              {invites.length}
            </Badge>
          )}
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
          <CardContent className="p-4 sm:p-6">
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

      {activeTab === "invites" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Invites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Enter email addresses to invite people to this potluck.
                They&apos;ll get a unique link to join.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="email@example.com, friend@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendInvites(); }}
                  className="flex-1"
                />
                <Button
                  onClick={sendInvites}
                  disabled={sendingInvites || !inviteEmail.trim()}
                >
                  {sendingInvites ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-1.5 h-4 w-4" />
                  )}
                  Invite
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Separate multiple emails with commas, semicolons, or spaces.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Invited Guests
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {invites.filter((i) => i.accepted).length}/{invites.length} accepted
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invites.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">
                    No invites sent yet.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add email addresses above to invite people.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {invite.email}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {invite.accepted ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <Check className="h-3 w-3" />
                              Accepted
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyInviteLink(invite.code)}
                          title="Copy invite link"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => shareInvite(invite)}
                          title="Send via email"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteInvite(invite.id)}
                          title="Remove invite"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {potluck.access_level !== "invite_only" && (
            <Card className="border-dashed">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> This potluck is set to{" "}
                  <Badge variant="outline" className="mx-1">
                    {potluck.access_level === "public" ? "Public" : "Link Only"}
                  </Badge>
                  — anyone with the link can view it. Switch to{" "}
                  <strong>Invite Only</strong> if you want to restrict access to
                  only invited guests.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

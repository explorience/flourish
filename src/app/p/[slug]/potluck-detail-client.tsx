"use client";

import { useRealtimeClaims, useRealtimeOffers } from "@/hooks/use-realtime-claims";
import { NeedsList } from "@/components/needs-list";
import { OfferSection } from "@/components/offer-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Globe, Link as LinkIcon, Lock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Potluck, NeedWithClaims, Offer, Profile } from "@/types/database";

interface PotluckDetailClientProps {
  potluck: Potluck;
  initialNeeds: NeedWithClaims[];
  initialOffers: Offer[];
  host: Pick<Profile, "id" | "display_name" | "avatar_url"> | null;
}

export function PotluckDetailClient({
  potluck,
  initialNeeds,
  initialOffers,
  host,
}: PotluckDetailClientProps) {
  const { needs, refetchNeeds } = useRealtimeClaims(potluck.id, initialNeeds);
  const { offers, refetchOffers } = useRealtimeOffers(potluck.id, initialOffers);

  const accessIcon =
    potluck.access_level === "public" ? (
      <Globe className="h-3.5 w-3.5" />
    ) : potluck.access_level === "link_shared" ? (
      <LinkIcon className="h-3.5 w-3.5" />
    ) : (
      <Lock className="h-3.5 w-3.5" />
    );

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Banner */}
      {potluck.banner_url ? (
        <div className="aspect-[16/9] w-full rounded-xl overflow-hidden">
          <img
            src={potluck.banner_url}
            alt={potluck.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-gradient-to-br from-warm-cream-dark to-warm-golden-light flex items-center justify-center">
          <span className="text-7xl opacity-30">🍲</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold">{potluck.title}</h1>
          <Badge variant="outline" className="shrink-0 flex items-center gap-1">
            {accessIcon}
            {potluck.access_level === "public"
              ? "Public"
              : potluck.access_level === "link_shared"
                ? "Link Shared"
                : "Invite Only"}
          </Badge>
        </div>

        <p className="text-muted-foreground">{potluck.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatDateTime(potluck.event_date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>{potluck.location}</span>
          </div>
        </div>

        {host && (
          <div className="flex items-center gap-2 text-sm">
            <Avatar className="h-6 w-6">
              <AvatarImage src={host.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-warm-green text-white">
                {host.display_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">
              Hosted by{" "}
              <span className="font-medium text-foreground">
                {host.display_name}
              </span>
            </span>
          </div>
        )}
      </div>

      <Separator />

      {/* Needs */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">What&apos;s Needed</h2>
          <NeedsList
            needs={needs}
            potluckId={potluck.id}
            onClaimed={() => refetchNeeds()}
          />
        </CardContent>
      </Card>

      {/* Offers */}
      {potluck.open_offers && (
        <Card>
          <CardContent className="p-6">
            <OfferSection
              potluckId={potluck.id}
              offers={offers}
              onOfferAdded={() => refetchOffers()}
            />
          </CardContent>
        </Card>
      )}

      {potluck.points_enabled && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-lg">🏆</span>
              <span>
                This potluck has <strong>Potluck Points</strong> enabled.
                Contribute and earn reputation when the host verifies your
                contribution.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

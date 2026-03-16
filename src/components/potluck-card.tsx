import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin } from "lucide-react";
import { formatDate, getClaimProgress } from "@/lib/utils";
import type { Potluck, Need } from "@/types/database";

interface PotluckCardProps {
  potluck: Potluck & { needs: Pick<Need, "quantity" | "claimed_quantity">[] };
}

export function PotluckCard({ potluck }: PotluckCardProps) {
  const progress = getClaimProgress(potluck.needs);

  return (
    <Link href={`/p/${potluck.slug}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer h-full">
        <div className="aspect-[16/9] relative bg-muted overflow-hidden">
          {potluck.banner_url ? (
            <img
              src={potluck.banner_url}
              alt={potluck.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-warm-cream-dark to-warm-golden-light">
              <span className="text-5xl opacity-50">🍲</span>
            </div>
          )}
          {potluck.points_enabled && (
            <Badge className="absolute top-2 right-2" variant="warm">
              Points enabled
            </Badge>
          )}
        </div>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {potluck.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {potluck.description}
          </p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(potluck.event_date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{potluck.location}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {progress.claimed}/{progress.total} items claimed
              </span>
              <span>{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

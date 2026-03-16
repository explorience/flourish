import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Trophy, ChefHat, Users } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params;
  let profile = null;
  let hostedCount = 0;
  let participatedCount = 0;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, total_points")
      .eq("id", id)
      .single();

    if (error || !data) return notFound();
    profile = data;

    const [hosted, claims] = await Promise.all([
      supabase
        .from("potlucks")
        .select("id", { count: "exact", head: true })
        .eq("host_id", id),
      supabase
        .from("claims")
        .select("potluck_id", { count: "exact", head: true })
        .eq("profile_id", id),
    ]);

    hostedCount = hosted.count || 0;
    participatedCount = claims.count || 0;
  } catch {
    return notFound();
  }

  return (
    <div className="container max-w-lg py-8">
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <Avatar className="h-20 w-20 mx-auto">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl bg-warm-green text-white">
              {profile.display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h1 className="text-2xl font-bold">{profile.display_name}</h1>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-center gap-1.5 text-warm-golden">
                <Trophy className="h-5 w-5" />
                <span className="text-2xl font-bold">
                  {profile.total_points}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Points</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-warm-green">
                <ChefHat className="h-5 w-5" />
                <span className="text-2xl font-bold">{hostedCount}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Hosted</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-warm-terracotta">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">
                  {participatedCount}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Joined</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { code } = await params;

  try {
    const supabase = await createClient();

    const { data: invite, error } = await supabase
      .from("invites")
      .select("*, potlucks(slug)")
      .eq("code", code)
      .single();

    if (error || !invite || !invite.potlucks) return notFound();

    if (!invite.accepted) {
      await supabase
        .from("invites")
        .update({ accepted: true })
        .eq("id", invite.id);
    }

    redirect(`/p/${(invite.potlucks as any).slug}`);
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return notFound();
  }
}

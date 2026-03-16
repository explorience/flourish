import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";
import { z } from "zod";

const InviteSchema = z.object({
  emails: z.array(z.string().email()),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: potluck } = await supabase
      .from("potlucks")
      .select()
      .eq("slug", slug)
      .single();

    if (!potluck || potluck.host_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = InviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    const invites = parsed.data.emails.map((email) => ({
      potluck_id: potluck.id,
      email,
      code: nanoid(8),
    }));

    const { data, error } = await supabase
      .from("invites")
      .insert(invites)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create invites" },
        { status: 500 }
      );
    }

    const inviteLinks = (data || []).map((inv) => ({
      email: inv.email,
      code: inv.code,
      link: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inv.code}`,
    }));

    return NextResponse.json({ invites: inviteLinks });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

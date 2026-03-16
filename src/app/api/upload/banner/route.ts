import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 5MB." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/${nanoid()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Upload failed", details: uploadError.message },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("banners").getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

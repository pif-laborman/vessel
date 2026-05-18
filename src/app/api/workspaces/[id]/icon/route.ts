import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // Validate: must be an image, max 1MB
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 1MB)" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify workspace belongs to user
  const { data: workspace } = await admin
    .from("workspaces")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  // Upload to storage
  const ext = file.name.split(".").pop() || "png";
  const storagePath = `${id}/icon.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from("workspace-icons")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = admin.storage
    .from("workspace-icons")
    .getPublicUrl(storagePath);

  const iconUrl = urlData.publicUrl;

  // Update workspace record
  await admin
    .from("workspaces")
    .update({ icon_url: iconUrl, updated_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ icon_url: iconUrl });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  const { data: workspace } = await admin
    .from("workspaces")
    .select("id, icon_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  // Remove file from storage if it exists
  if (workspace.icon_url) {
    const path = workspace.icon_url.split("/workspace-icons/").pop();
    if (path) {
      await admin.storage.from("workspace-icons").remove([decodeURIComponent(path)]);
    }
  }

  await admin
    .from("workspaces")
    .update({ icon_url: null, updated_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ icon_url: null });
}

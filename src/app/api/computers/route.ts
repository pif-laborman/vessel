import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

// POST /api/computers - Create a new computer
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = body.name || "MyComputer";
    const cpu = [1, 2, 4, 8, 16].includes(body.cpu) ? body.cpu : 1;
    const ram = [4, 8, 16, 32, 64].includes(body.ram) ? body.ram : 4;
    const diskSizeGb = body.disk_size_gb || 8;

    const admin = createAdminClient();

    // Ensure user has a default workspace
    let { data: workspace } = await admin
      .from("workspaces")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!workspace) {
      const { data: newWs, error: wsErr } = await admin
        .from("workspaces")
        .insert({ user_id: user.id, name: "Default" })
        .select("id")
        .single();
      if (wsErr) {
        return NextResponse.json({ error: wsErr.message }, { status: 500 });
      }
      workspace = newWs;
    }

    // Create the computer record
    const { data: computer, error } = await admin
      .from("computers")
      .insert({
        workspace_id: workspace!.id,
        user_id: user.id,
        name,
        os: "linux",
        cpu,
        ram,
        disk_size_gb: diskSizeGb,
        status: "creating",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: trigger actual container provisioning here
    // For now, simulate transition to "running" after insert
    await admin
      .from("computers")
      .update({ status: "running", updated_at: new Date().toISOString() })
      .eq("id", computer.id);

    return NextResponse.json({ ...computer, status: "running" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// GET /api/computers - List all computers
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: computers } = await supabase
    .from("computers")
    .select("*")
    .not("status", "eq", "terminated")
    .order("created_at", { ascending: false });

  return NextResponse.json({ computers: computers || [], total: computers?.length || 0 });
}

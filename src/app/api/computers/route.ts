import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const VPS_API = process.env.VESSEL_VPS_API_URL || "https://meetpif.com/vessel-api";
const INTERNAL_TOKEN = process.env.VESSEL_INTERNAL_TOKEN || "";

async function vpsFetch(path: string, method: string, userId: string, body?: Record<string, unknown>) {
  const res = await fetch(`${VPS_API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${INTERNAL_TOKEN}`,
      "X-Vessel-User-Id": userId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

// POST /api/computers - Create a new computer (proxied to VPS)
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const vpsRes = await vpsFetch("/v1/computers", "POST", user.id, {
      name: body.name || "MyComputer",
      cpu: body.cpu || 1,
      ram: body.ram || 4,
      disk_size_gb: body.disk_size_gb || 8,
    });

    const data = await vpsRes.json();
    return NextResponse.json(data, { status: vpsRes.status });
  } catch {
    return NextResponse.json({ error: "Failed to create computer" }, { status: 500 });
  }
}

// GET /api/computers - List computers (proxied to VPS)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const vpsRes = await vpsFetch("/v1/computers", "GET", user.id);
    const data = await vpsRes.json();
    return NextResponse.json(data, { status: vpsRes.status });
  } catch {
    return NextResponse.json({ error: "Failed to list computers" }, { status: 500 });
  }
}

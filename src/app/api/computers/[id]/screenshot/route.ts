import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const VPS_API = process.env.VESSEL_VPS_API_URL || "https://meetpif.com/vessel-api";
const INTERNAL_TOKEN = process.env.VESSEL_INTERNAL_TOKEN || "";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const res = await fetch(`${VPS_API}/v1/computers/${id}/screenshot`, {
    headers: {
      Authorization: `Bearer ${INTERNAL_TOKEN}`,
      "X-Vessel-User-Id": user.id,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Failed" }));
    return NextResponse.json(data, { status: res.status });
  }

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}

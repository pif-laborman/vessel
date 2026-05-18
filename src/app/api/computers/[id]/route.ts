import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const VPS_API = process.env.CORIX_VPS_API_URL || "https://meetpif.com/corix-api";
const INTERNAL_TOKEN = process.env.CORIX_INTERNAL_TOKEN || "";

// DELETE /api/computers/:id
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const res = await fetch(`${VPS_API}/v1/computers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${INTERNAL_TOKEN}`,
      "X-Corix-User-Id": user.id,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

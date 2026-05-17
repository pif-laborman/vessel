import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { DashboardShell } from "./DashboardShell";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true });

  const { data: computers } = await supabase
    .from("computers")
    .select("*")
    .not("status", "eq", "terminated")
    .order("created_at", { ascending: false });

  const { data: apiKeys } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  return (
    <DashboardShell
      user={user}
      profile={profile}
      initialWorkspaces={workspaces || []}
      initialComputers={computers || []}
      initialApiKeys={apiKeys || []}
    />
  );
}

"use client";

import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleSignOut}
      className="hover:opacity-70 transition-opacity"
      style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}
    >
      Sign out
    </button>
  );
}

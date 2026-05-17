import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ApiKeysSection } from "./ApiKeysSection";
import { ComputersSection } from "./ComputersSection";
import { SignOutButton } from "./SignOutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-page)' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-sm)' }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--fill-action)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            Vessel
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="hover:opacity-70 transition-opacity" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Docs</Link>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {profile?.display_name || user.email}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-on-action)', background: 'var(--fill-action)', padding: '1px 8px', borderRadius: 'var(--radius-full)' }}>
                {profile?.plan || 'starter'}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-8)' }}>
          Dashboard
        </h1>

        {/* API Keys */}
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
            API Keys
          </h2>
          <ApiKeysSection />
        </section>

        {/* Computers */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
            Computers
          </h2>
          <ComputersSection />
        </section>
      </main>
    </div>
  );
}

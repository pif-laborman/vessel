"use client";

import { useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { SignOutButton } from "./SignOutButton";
import { ComputerGrid } from "./ComputerGrid";
import { ApiKeysPanel } from "./ApiKeysPanel";
import { DesktopViewer } from "./DesktopViewer";

interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  plan: string;
  max_computers: number;
}

interface Workspace {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface Computer {
  id: string;
  workspace_id: string;
  name: string;
  os: string;
  cpu: number;
  ram: number;
  status: string;
  created_at: string;
}

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

type SidebarView = "home" | "settings";

export function DashboardShell({
  user,
  profile,
  initialWorkspaces,
  initialComputers,
  initialApiKeys,
}: {
  user: User;
  profile: Profile | null;
  initialWorkspaces: Workspace[];
  initialComputers: Computer[];
  initialApiKeys: ApiKey[];
}) {
  const [view, setView] = useState<SidebarView>("home");
  const [computers] = useState(initialComputers);
  const [sortBy, setSortBy] = useState<"last_edited" | "name" | "created">("last_edited");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [viewingComputer, setViewingComputer] = useState<{ id: string; name: string } | null>(null);

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();
  const plan = profile?.plan || "starter";
  const computerCount = computers.length;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-page)" }}>
      {/* Sidebar */}
      <aside
        className="shrink-0 flex flex-col"
        style={{
          width: 220,
          borderRight: "1px solid var(--border)",
          background: "var(--bg-surface)",
        }}
      >
        {/* Workspace selector */}
        <div
          className="flex items-center gap-2 cursor-default"
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={{
              background: "var(--fill-action)",
              color: "var(--text-on-action)",
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "var(--text-xs)",
            }}
          >
            {initials}
          </div>
          <span
            className="truncate"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "var(--text-sm)",
            }}
          >
            {displayName}
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1" style={{ padding: "8px" }}>
          <button
            onClick={() => setView("home")}
            className="w-full text-left flex items-center gap-2 transition-colors"
            style={{
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-body)",
              fontWeight: view === "home" ? 500 : 400,
              color: view === "home" ? "var(--text-primary)" : "var(--text-secondary)",
              background: view === "home" ? "var(--bg-page)" : "transparent",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </button>
          <button
            onClick={() => setView("settings")}
            className="w-full text-left flex items-center gap-2 transition-colors"
            style={{
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-body)",
              fontWeight: view === "settings" ? 500 : 400,
              color: view === "settings" ? "var(--text-primary)" : "var(--text-secondary)",
              background: view === "settings" ? "var(--bg-page)" : "transparent",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Settings
          </button>
        </nav>

        {/* Bottom */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-on-action)",
              background: "var(--fill-action)",
              padding: "1px 8px",
              borderRadius: "var(--radius-full)",
              fontFamily: "var(--font-display)",
              fontWeight: 500,
            }}
          >
            {plan}
          </span>
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {view === "home" ? (
          <>
            {/* Top bar */}
            <div
              className="shrink-0 flex items-center justify-between"
              style={{
                padding: "10px 24px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)" }}>
                  Computers
                </span>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
                  {computerCount}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Sort</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    style={{
                      fontSize: "var(--text-xs)",
                      fontFamily: "var(--font-body)",
                      color: "var(--text-primary)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="last_edited">Last edited</option>
                    <option value="name">Name</option>
                    <option value="created">Created</option>
                  </select>
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>View</span>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setViewMode("grid")}
                      style={{
                        padding: "4px",
                        borderRadius: "var(--radius-sm)",
                        color: viewMode === "grid" ? "var(--text-primary)" : "var(--text-tertiary)",
                        background: viewMode === "grid" ? "var(--bg-surface)" : "transparent",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      style={{
                        padding: "4px",
                        borderRadius: "var(--radius-sm)",
                        color: viewMode === "list" ? "var(--text-primary)" : "var(--text-tertiary)",
                        background: viewMode === "list" ? "var(--bg-surface)" : "transparent",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Invite (placeholder) */}
                <Link
                  href="/docs"
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                  }}
                  className="hover:opacity-70 transition-opacity"
                >
                  Docs
                </Link>

                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: "var(--bg-warm)",
                    color: "var(--text-secondary)",
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                  }}
                >
                  {initials}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto" style={{ padding: "24px" }}>
              {computers.length === 0 ? (
                /* Empty state */
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>
                    Welcome to your workspace
                  </h2>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
                    Press <kbd style={{ padding: "1px 6px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}>N</kbd> or click below to spin up your first computer.
                  </p>
                  <ComputerGrid computers={[]} viewMode={viewMode} onSelectComputer={(id, name) => setViewingComputer({ id, name })} />
                </div>
              ) : (
                <ComputerGrid computers={computers} viewMode={viewMode} onSelectComputer={(id, name) => setViewingComputer({ id, name })} />
              )}
            </div>
          </>
        ) : (
          /* Settings view */
          <div className="flex-1 overflow-auto" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-lg)", marginBottom: "var(--space-6)" }}>
              Settings
            </h2>

            {/* Profile */}
            <section style={{ marginBottom: "var(--space-10)" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-base)", marginBottom: "var(--space-4)" }}>
                Profile
              </h3>
              <div className="card" style={{ padding: "var(--space-4)" }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: "var(--fill-action)",
                      color: "var(--text-on-action)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)" }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* API Keys */}
            <section>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-base)", marginBottom: "var(--space-4)" }}>
                API Keys
              </h3>
              <ApiKeysPanel initialKeys={initialApiKeys} />
            </section>
          </div>
        )}
      </div>

      {/* Desktop viewer overlay */}
      {viewingComputer && (
        <DesktopViewer
          computerId={viewingComputer.id}
          computerName={viewingComputer.name}
          onClose={() => setViewingComputer(null)}
        />
      )}
    </div>
  );
}

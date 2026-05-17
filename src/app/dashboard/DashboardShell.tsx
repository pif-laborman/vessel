"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { SignOutButton } from "./SignOutButton";
import { ApiKeysPanel } from "./ApiKeysPanel";
import { DesktopViewer } from "./DesktopViewer";
import { CreateComputerPopover } from "./CreateComputerPopover";

interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  plan: string;
  max_computers: number;
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

type View = "home" | "settings" | "computer";

function SidebarThumbnail({ computer, selected, onClick }: {
  computer: Computer;
  selected: boolean;
  onClick: () => void;
}) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (computer.status !== "running") return;
    let cancelled = false;

    async function fetchThumb() {
      try {
        const res = await fetch(`/api/computers/${computer.id}/screenshot`);
        if (res.ok && !cancelled) {
          const blob = await res.blob();
          setThumbUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob); });
        }
      } catch {}
    }

    fetchThumb();
    const interval = setInterval(fetchThumb, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [computer.id, computer.status]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-all"
      style={{
        padding: "6px",
        borderRadius: "var(--radius-md)",
        border: selected ? "2px solid var(--fill-action)" : "2px solid transparent",
        background: selected ? "var(--bg-page)" : "transparent",
      }}
    >
      {/* Thumbnail */}
      <div
        className="w-full overflow-hidden flex items-center justify-center"
        style={{
          aspectRatio: "16/10",
          borderRadius: "var(--radius-sm)",
          background: "#1a1a2e",
        }}
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={computer.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1">
            <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
          </svg>
        )}
      </div>
      {/* Name */}
      <div className="flex items-center justify-between" style={{ marginTop: "var(--space-1)", padding: "0 2px" }}>
        <span className="truncate" style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-display)", fontWeight: 500, color: "var(--text-primary)" }}>
          {computer.name}
        </span>
        {computer.status === "running" && (
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#03A97E" }} />
        )}
      </div>
    </button>
  );
}

export function DashboardShell({
  user,
  profile,
  initialComputers,
  initialApiKeys,
}: {
  user: User;
  profile: Profile | null;
  initialWorkspaces: unknown[];
  initialComputers: Computer[];
  initialApiKeys: ApiKey[];
}) {
  const [view, setView] = useState<View>(initialComputers.length > 0 ? "computer" : "home");
  const [computers, setComputers] = useState(initialComputers);
  const [selectedComputerId, setSelectedComputerId] = useState<string | null>(
    initialComputers.length > 0 ? initialComputers[0].id : null
  );
  const [showCreate, setShowCreate] = useState(false);

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();
  const plan = profile?.plan || "starter";

  const selectedComputer = computers.find((c) => c.id === selectedComputerId) || null;

  const handleSelectComputer = useCallback((id: string) => {
    setSelectedComputerId(id);
    setView("computer");
  }, []);

  const handleCreated = useCallback((computer: Computer) => {
    setComputers((prev) => [computer, ...prev]);
    setSelectedComputerId(computer.id);
    setView("computer");
    setShowCreate(false);
  }, []);

  // Keyboard shortcut: N to create
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "n" || e.key === "N") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
        e.preventDefault();
        setShowCreate(true);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-page)" }}>
      {/* Sidebar */}
      <aside
        className="shrink-0 flex flex-col"
        style={{
          width: 240,
          borderRight: "1px solid var(--border)",
          background: "var(--bg-surface)",
        }}
      >
        {/* Workspace selector */}
        <div
          className="flex items-center gap-2 cursor-default"
          style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "var(--fill-action)", color: "var(--text-on-action)", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-xs)" }}
          >
            {initials}
          </div>
          <span className="truncate" style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)" }}>
            {displayName}
          </span>
        </div>

        {/* Home nav */}
        <div style={{ padding: "8px" }}>
          <button
            onClick={() => setView("home")}
            className="w-full text-left flex items-center justify-between transition-colors"
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
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </span>
            <kbd style={{ padding: "0px 5px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)", background: "var(--bg-page)" }}>
              H
            </kbd>
          </button>
        </div>

        {/* Computer thumbnails */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "0 8px 8px" }}>
          {computers.map((c) => (
            <SidebarThumbnail
              key={c.id}
              computer={c}
              selected={view === "computer" && selectedComputerId === c.id}
              onClick={() => handleSelectComputer(c.id)}
            />
          ))}

          {/* New computer button */}
          <div className="relative">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 transition-colors hover:opacity-70"
              style={{
                padding: "var(--space-6) var(--space-4)",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--border)",
                marginTop: "var(--space-2)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
                New computer
              </span>
              <kbd style={{ padding: "0px 4px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>
                N
              </kbd>
            </button>
            {showCreate && (
              <CreateComputerPopover
                onClose={() => setShowCreate(false)}
                onCreated={handleCreated}
              />
            )}
          </div>
        </div>

        {/* Bottom: settings + plan */}
        <div style={{ padding: "8px", borderTop: "1px solid var(--border)" }}>
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
          <div className="flex items-center justify-between" style={{ padding: "8px 10px" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-on-action)", background: "var(--fill-action)", padding: "1px 8px", borderRadius: "var(--radius-full)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {plan}
            </span>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {view === "computer" && selectedComputer ? (
          <>
            {/* Computer top bar */}
            <div
              className="shrink-0 flex items-center justify-between"
              style={{ padding: "10px 24px", borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                </svg>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)" }}>
                  {selectedComputer.name}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: selectedComputer.status === "running" ? "#03A97E" : "#999" }} />
                  <span style={{ fontSize: "var(--text-xs)", color: selectedComputer.status === "running" ? "#03A97E" : "var(--text-tertiary)" }}>
                    {selectedComputer.status}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                  {selectedComputer.cpu} vCPU / {selectedComputer.ram} GB
                </span>
                <Link href="/docs" className="hover:opacity-70 transition-opacity" style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
                  Docs
                </Link>
              </div>
            </div>

            {/* Inline desktop viewer */}
            <div className="flex-1 overflow-hidden" style={{ background: "#0a0a0f" }}>
              <DesktopViewer
                computerId={selectedComputer.id}
                computerName={selectedComputer.name}
                onClose={() => setView("home")}
                inline
              />
            </div>
          </>
        ) : view === "settings" ? (
          <div className="flex-1 overflow-auto" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-lg)", marginBottom: "var(--space-6)" }}>
              Settings
            </h2>
            <section style={{ marginBottom: "var(--space-10)" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-base)", marginBottom: "var(--space-4)" }}>
                Profile
              </h3>
              <div className="card" style={{ padding: "var(--space-4)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--fill-action)", color: "var(--text-on-action)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)" }}>{displayName}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{user.email}</div>
                  </div>
                </div>
              </div>
            </section>
            <section>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-base)", marginBottom: "var(--space-4)" }}>
                API Keys
              </h3>
              <ApiKeysPanel initialKeys={initialApiKeys} />
            </section>
          </div>
        ) : (
          /* Home / empty state */
          <div className="flex-1 flex items-center justify-center" style={{ padding: "24px" }}>
            <div className="text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1" className="mx-auto" style={{ marginBottom: "var(--space-4)" }}>
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
              </svg>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>
                Welcome to your workspace
              </h2>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-6)", maxWidth: 360 }}>
                Press <kbd style={{ padding: "1px 6px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}>N</kbd> or click &ldquo;New computer&rdquo; in the sidebar to spin up your first machine.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

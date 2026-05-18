"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { DesktopViewer } from "./DesktopViewer";
import { CreateComputerPopover } from "./CreateComputerPopover";
import { ComputerMenu } from "./ComputerMenu";
import { HomeGrid } from "./HomeGrid";
import { WorkspaceMenu } from "./WorkspaceMenu";
import { UnifiedSettings } from "./UnifiedSettings";

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
  hostname?: string | null;
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

type View = "home" | "computer";

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
        const res = await fetch(`/api/computers/${computer.id}/screenshot?format=jpeg`);
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
        padding: "8px",
        borderRadius: "var(--radius-md)",
        border: selected ? "2px solid var(--fill-action)" : "2px solid transparent",
        background: selected ? "var(--bg-page)" : "transparent",
        marginBottom: "var(--space-2)",
      }}
    >
      {/* Thumbnail: full width, large aspect ratio */}
      <div
        className="w-full overflow-hidden flex items-center justify-center"
        style={{
          aspectRatio: "16/10",
          borderRadius: "6px",
          background: "#1a1a2e",
        }}
      >
        {thumbUrl ? (
          <img src={thumbUrl} alt={computer.name} className="w-full h-full object-cover" draggable={false} />
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1">
            <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
          </svg>
        )}
      </div>
      {/* Name + status */}
      <div className="flex items-center justify-between" style={{ marginTop: "6px", padding: "0 2px" }}>
        <span className="truncate" style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-display)", fontWeight: 500, color: selected ? "var(--text-primary)" : "var(--text-secondary)" }}>
          {computer.name}
        </span>
        {computer.status === "running" && (
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#03A97E" }} />
        )}
      </div>
    </button>
  );
}

interface Workspace {
  id: string;
  name: string;
  status: string;
  icon_url: string | null;
  created_at: string;
}

export function DashboardShell({
  user,
  profile,
  initialWorkspaces,
  initialComputers,
  initialApiKeys,
  initialComputerId,
}: {
  user: User;
  profile: Profile | null;
  initialWorkspaces: Workspace[];
  initialComputers: Computer[];
  initialApiKeys: ApiKey[];
  initialComputerId?: string;
}) {
  // If a computer ID was passed (from /dashboard/computers/:id), use it
  const initialSelected = initialComputerId && initialComputers.some((c) => c.id === initialComputerId)
    ? initialComputerId
    : initialComputers.length > 0 ? initialComputers[0].id : null;
  const initialView: View = initialSelected ? "computer" : "home";

  const [view, setView] = useState<View>(initialView);
  const [computers, setComputers] = useState(initialComputers);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    initialWorkspaces.length > 0 ? initialWorkspaces[0].id : null
  );
  const [selectedComputerId, setSelectedComputerId] = useState<string | null>(initialSelected);
  const [showCreate, setShowCreate] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string | null>(null);

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();
  const plan = profile?.plan || "starter";
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || null;

  const handleCreateWorkspace = useCallback(async (name: string) => {
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.id) {
        setWorkspaces((prev) => [...prev, data]);
        setActiveWorkspaceId(data.id);
        setComputers([]);
        goHome();
      }
    } catch {}
  }, []);

  const handleSwitchWorkspace = useCallback((id: string) => {
    setActiveWorkspaceId(id);
    goHome();
    // Reload computers for this workspace
    fetch("/api/computers")
      .then((r) => r.json())
      .then((data) => {
        const all = data.computers || [];
        setComputers(all.filter((c: Computer) => c.workspace_id === id));
      })
      .catch(() => {});
  }, []);

  const selectedComputer = computers.find((c) => c.id === selectedComputerId) || null;

  const goHome = useCallback(() => {
    setSelectedComputerId(null);
    setView("home");
    window.history.pushState(null, "", "/dashboard");
  }, []);

  const handleSelectComputer = useCallback((id: string) => {
    setSelectedComputerId(id);
    setView("computer");
    window.history.pushState(null, "", `/dashboard/computers/${id}`);
  }, []);

  const handleCreated = useCallback((computer: Computer) => {
    setComputers((prev) => [computer, ...prev]);
    setSelectedComputerId(computer.id);
    setView("computer");
    setShowCreate(false);
    window.history.pushState(null, "", `/dashboard/computers/${computer.id}`);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedComputerId) return;
    try {
      await fetch(`/api/computers/${selectedComputerId}`, { method: "DELETE" });
      setComputers((prev) => prev.filter((c) => c.id !== selectedComputerId));
      goHome();
    } catch {}
  }, [selectedComputerId]);

  const handleRestart = useCallback(async () => {
    if (!selectedComputerId) return;
    setComputers((prev) => prev.map((c) => c.id === selectedComputerId ? { ...c, status: "restarting" } : c));
    try {
      await fetch(`/api/computers/${selectedComputerId}/restart`, { method: "POST" });
      setTimeout(() => {
        setComputers((prev) => prev.map((c) => c.id === selectedComputerId ? { ...c, status: "running" } : c));
      }, 3000);
    } catch {}
  }, [selectedComputerId]);

  const handleClone = useCallback(async () => {
    if (!selectedComputer) return;
    try {
      const res = await fetch("/api/computers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${selectedComputer.name} (copy)`,
          cpu: selectedComputer.cpu,
          ram: selectedComputer.ram,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setComputers((prev) => [data, ...prev]);
        setSelectedComputerId(data.id);
      }
    } catch {}
  }, [selectedComputer]);

  // Handle browser back/forward
  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname;
      const match = path.match(/\/dashboard\/computers\/([^/]+)/);
      if (match) {
        const id = match[1];
        if (computers.some((c) => c.id === id)) {
          setSelectedComputerId(id);
          setView("computer");
        }
      } else {
        setSelectedComputerId(null);
        setView("home");
      }
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [computers]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
      if (e.key === "n" || e.key === "N") { e.preventDefault(); setShowCreate(true); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-page)" }}>
      {/* Sidebar: wider (280px) for bigger thumbnails */}
      <aside
        className="shrink-0 flex flex-col"
        style={{ width: 280, borderRight: "1px solid var(--border)", background: "var(--bg-surface)" }}
      >
        {/* Workspace dropdown */}
        <WorkspaceMenu
          displayName={displayName}
          initials={initials}
          email={user.email || ""}
          plan={plan}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          activeWorkspaceName={activeWorkspace?.name || null}
          onSettings={() => setSettingsTab("workspace")}
          onSwitchWorkspace={handleSwitchWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
          activeWorkspaceIconUrl={activeWorkspace?.icon_url || null}
        />

        {/* Home */}
        <div style={{ padding: "8px 8px 4px" }}>
          <button
            onClick={goHome}
            className="w-full text-left flex items-center justify-between transition-colors"
            style={{
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-body)",
              fontWeight: view === "home" ? 500 : 400,
              color: view === "home" && !selectedComputerId ? "var(--text-primary)" : "var(--text-secondary)",
              background: view === "home" && !selectedComputerId ? "var(--bg-page)" : "transparent",
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
        <div className="flex-1 overflow-y-auto" style={{ padding: "4px 8px 8px" }}>
          {computers.map((c) => (
            <SidebarThumbnail
              key={c.id}
              computer={c}
              selected={view === "computer" && selectedComputerId === c.id}
              onClick={() => handleSelectComputer(c.id)}
            />
          ))}

          {/* New computer */}
          <div className="relative">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 transition-colors hover:opacity-70"
              style={{
                padding: "var(--space-8) var(--space-4)",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--border)",
                marginTop: "var(--space-1)",
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
              <CreateComputerPopover onClose={() => setShowCreate(false)} onCreated={handleCreated} />
            )}
          </div>
        </div>

        {/* Plan badge */}
        <div className="flex items-center justify-center" style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-on-action)", background: "var(--fill-action)", padding: "2px 10px", borderRadius: "var(--radius-full)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
            {plan}
          </span>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {view === "computer" && selectedComputer ? (
          <>
            {/* Minimal top bar: name + "..." together, left-aligned */}
            <div
              className="shrink-0 flex items-center"
              style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                </svg>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)" }}>
                  {selectedComputer.name}
                </span>
                <ComputerMenu
                  computerId={selectedComputer.id}
                  computerName={selectedComputer.name}
                  onDelete={handleDelete}
                  onRestart={handleRestart}
                  onClone={handleClone}
                  onSettings={() => setSettingsTab(`computer:${selectedComputer.id}`)}
                />
              </div>
            </div>

            {/* Desktop: edge-to-edge, minimal padding */}
            <div className="flex-1 overflow-hidden" style={{ background: "#0a0a0f" }}>
              <DesktopViewer
                computerId={selectedComputer.id}
                computerName={selectedComputer.name}
                hostname={selectedComputer.hostname}
                onClose={goHome}
                inline
              />
            </div>
          </>
        ) : (
          /* Home: computer grid with top bar */
          <HomeGrid
            computers={computers}
            onSelectComputer={handleSelectComputer}
            onCreated={handleCreated}
          />
        )}
      </div>

      {/* Unified settings modal */}
      {settingsTab && (
        <UnifiedSettings
          workspaceName={activeWorkspace?.name || "Default"}
          workspaceId={activeWorkspaceId}
          displayName={displayName}
          email={user.email || ""}
          plan={plan}
          initials={initials}
          computers={computers}
          apiKeys={initialApiKeys}
          initialTab={settingsTab}
          onClose={() => setSettingsTab(null)}
          onDeleteComputer={(id) => {
            fetch(`/api/computers/${id}`, { method: "DELETE" });
            setComputers((prev) => prev.filter((c) => c.id !== id));
            if (selectedComputerId === id) { goHome(); }
          }}
          onRenameComputer={(id, name) => {
            setComputers((prev) => prev.map((c) => c.id === id ? { ...c, name } : c));
          }}
          onDeleteWorkspace={() => { setSettingsTab(null); }}
          onRenameWorkspace={(name) => {
            if (!activeWorkspaceId) return;
            setWorkspaces((prev) => prev.map((w) => w.id === activeWorkspaceId ? { ...w, name } : w));
            fetch(`/api/workspaces/${activeWorkspaceId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name }),
            }).catch(() => {});
          }}
          workspaceIconUrl={activeWorkspace?.icon_url || null}
          onIconUploaded={(url) => {
            if (!activeWorkspaceId) return;
            setWorkspaces((prev) => prev.map((w) => w.id === activeWorkspaceId ? { ...w, icon_url: url } : w));
          }}
        />
      )}
    </div>
  );
}

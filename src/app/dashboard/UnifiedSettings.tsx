"use client";

import { useState, useEffect, useRef } from "react";
import { ApiKeysPanel } from "./ApiKeysPanel";

interface Computer {
  id: string;
  workspace_id: string;
  name: string;
  os: string;
  cpu: number;
  ram: number;
  status: string;
  resolution?: string;
}

interface Workspace {
  id: string;
  name: string;
}

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

interface Props {
  workspaceName: string;
  workspaceId: string | null;
  displayName: string;
  email: string;
  plan: string;
  initials: string;
  computers: Computer[];
  apiKeys: ApiKey[];
  initialTab?: string;
  onClose: () => void;
  onDeleteComputer: (id: string) => void;
  onRenameComputer: (id: string, name: string) => void;
  onDeleteWorkspace: () => void;
  onRenameWorkspace: (name: string) => void;
  workspaceIconUrl?: string | null;
  onIconUploaded?: (url: string) => void;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="shrink-0 hover:opacity-70 transition-opacity"
      style={{ padding: "6px", borderRadius: "var(--radius-sm)", color: "var(--text-tertiary)" }}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#03A97E" strokeWidth="2" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
      )}
    </button>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: "var(--space-6)" }}>
      <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-2)", fontFamily: "var(--font-display)" }}>
        {label}
      </label>
      <div className="flex items-center" style={{ height: 42, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", padding: "0 var(--space-3)", background: "var(--bg-surface)" }}>
        <span className="flex-1 truncate" style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
          {value}
        </span>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

// Workspace settings panel
function WorkspacePanel({ workspaceName, workspaceId, workspaceIconUrl, apiKeys, onDeleteWorkspace, onRenameWorkspace, onIconUploaded }: {
  workspaceName: string;
  workspaceId: string | null;
  workspaceIconUrl: string | null;
  apiKeys: ApiKey[];
  onDeleteWorkspace: () => void;
  onRenameWorkspace: (name: string) => void;
  onIconUploaded: (url: string) => void;
}) {
  const [name, setName] = useState(workspaceName);
  const [iconUrl, setIconUrl] = useState(workspaceIconUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    if (name.trim() && name.trim() !== workspaceName) {
      onRenameWorkspace(name.trim());
    }
  }

  async function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !workspaceId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/workspaces/${workspaceId}/icon`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.icon_url) {
        setIconUrl(data.icon_url);
        onIconUploaded(data.icon_url);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-lg)", marginBottom: "var(--space-6)" }}>Workspace settings</h2>

      {/* Icon + Name row */}
      <div className="flex gap-4" style={{ marginBottom: "var(--space-6)" }}>
        {/* Icon */}
        <div>
          <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-2)", fontFamily: "var(--font-display)" }}>Icon</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleIconUpload} className="hidden" style={{ display: "none" }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden"
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              cursor: "pointer",
              position: "relative",
            }}
          >
            {uploading ? (
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>...</span>
            ) : iconUrl ? (
              <img src={iconUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span style={{ fontSize: "var(--text-2xl)" }}>
                {workspaceName.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </div>
        {/* Name */}
        <div className="flex-1">
          <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-2)", fontFamily: "var(--font-display)" }}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} onBlur={handleSave} onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }} style={{ width: "100%", height: 42, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", padding: "0 var(--space-3)", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)", color: "var(--text-primary)", outline: "none" }} />
        </div>
      </div>

      {workspaceId && <ReadonlyField label="Workspace ID" value={workspaceId} />}

      <div style={{ marginBottom: "var(--space-6)" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-base)", marginBottom: "var(--space-4)" }}>API Keys</h3>
        <ApiKeysPanel initialKeys={apiKeys} />
      </div>

      <a href="/docs" style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontFamily: "var(--font-body)" }} className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity">
        API docs <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </a>

      <div className="flex items-center justify-between" style={{ marginTop: "var(--space-10)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>Permanently delete this workspace and all its computers.</span>
        <button onClick={onDeleteWorkspace} className="hover:opacity-80 transition-opacity" style={{ fontSize: "var(--text-sm)", color: "var(--color-error)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
          Delete workspace
        </button>
      </div>
    </div>
  );
}

// Members panel (placeholder)
function MembersPanel() {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-lg)", marginBottom: "var(--space-4)" }}>Members</h2>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>Team members and invitations will appear here.</p>
    </div>
  );
}

// Profile panel
function ProfilePanel({ displayName, email, plan, initials }: { displayName: string; email: string; plan: string; initials: string }) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-lg)", marginBottom: "var(--space-6)" }}>Profile</h2>
      <div className="card flex items-center gap-3" style={{ padding: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--fill-action)", color: "var(--text-on-action)", fontFamily: "var(--font-display)", fontWeight: 500 }}>{initials}</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)" }}>{displayName}</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{email}</div>
        </div>
      </div>
      <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-4)" }}>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>Plan</span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-on-action)", background: "var(--fill-action)", padding: "2px 10px", borderRadius: "var(--radius-full)", fontFamily: "var(--font-display)", fontWeight: 500 }}>{plan}</span>
      </div>
    </div>
  );
}

// Computer settings panel
function ComputerPanel({ computer, onDelete, onRename }: { computer: Computer; onDelete: () => void; onRename: (name: string) => void }) {
  const [name, setName] = useState(computer.name);
  const apiEndpoint = `https://corix.dev/api/v1/computers/${computer.id}`;
  const res = computer.resolution || "1280x720x24";
  const resDisplay = res.replace(/x24$/i, "").replace(/x/g, " x ");

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-lg)", marginBottom: "var(--space-6)" }}>{computer.name}</h2>

      <div style={{ marginBottom: "var(--space-6)" }}>
        <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-2)", fontFamily: "var(--font-display)" }}>Computer Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => { if (name.trim() && name !== computer.name) onRename(name.trim()); }} onKeyDown={(e) => { if (e.key === "Enter" && name.trim() && name !== computer.name) onRename(name.trim()); }} style={{ width: "100%", height: 42, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", padding: "0 var(--space-3)", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)", color: "var(--text-primary)", outline: "none" }} />
      </div>

      <ReadonlyField label="Computer ID" value={computer.id} />
      <ReadonlyField label="API Endpoint" value={apiEndpoint} />

      <div className="flex gap-6" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <label style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", fontFamily: "var(--font-display)" }}>Display</label>
          <div style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: 4 }}>{resDisplay}</div>
        </div>
        <div>
          <label style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", fontFamily: "var(--font-display)" }}>CPU</label>
          <div style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: 4 }}>{computer.cpu} vCPU</div>
        </div>
        <div>
          <label style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", fontFamily: "var(--font-display)" }}>RAM</label>
          <div style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: 4 }}>{computer.ram} GB</div>
        </div>
        <div>
          <label style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", fontFamily: "var(--font-display)" }}>Status</label>
          <div className="flex items-center gap-1.5" style={{ marginTop: 4 }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: computer.status === "running" ? "#03A97E" : "#999" }} />
            <span style={{ fontSize: "var(--text-sm)", color: computer.status === "running" ? "#03A97E" : "var(--text-tertiary)" }}>{computer.status}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between" style={{ paddingTop: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>Permanently delete this computer.</span>
        <button onClick={onDelete} className="hover:opacity-80 transition-opacity" style={{ fontSize: "var(--text-sm)", color: "var(--color-error)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
          Delete computer
        </button>
      </div>
    </div>
  );
}

export function UnifiedSettings({ workspaceName, workspaceId, displayName, email, plan, initials, computers, apiKeys, initialTab, onClose, onDeleteComputer, onRenameComputer, onDeleteWorkspace, onRenameWorkspace, workspaceIconUrl, onIconUploaded }: Props) {
  const [activeTab, setActiveTab] = useState(initialTab || "workspace");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const navItemStyle = (active: boolean): React.CSSProperties => ({
    width: "100%",
    textAlign: "left",
    padding: "6px 12px",
    borderRadius: "var(--radius-sm)",
    fontSize: "var(--text-sm)",
    fontFamily: "var(--font-body)",
    fontWeight: active ? 500 : 400,
    color: active ? "var(--text-primary)" : "var(--text-secondary)",
    background: active ? "var(--bg-surface)" : "transparent",
    cursor: "pointer",
    border: "none",
    transition: "background 0.1s ease",
    display: "block",
  });

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: "var(--text-xs)",
    color: "var(--text-tertiary)",
    fontFamily: "var(--font-display)",
    fontWeight: 500,
    padding: "12px 12px 4px",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        className="flex"
        style={{
          width: "90vw",
          maxWidth: 720,
          height: "80vh",
          maxHeight: 600,
          background: "var(--bg-page)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Sidebar nav */}
        <div className="shrink-0 flex flex-col" style={{ width: 200, borderRight: "1px solid var(--border)", background: "var(--bg-surface)", padding: "4px" }}>
          {/* Workspace name */}
          <div style={{ ...sectionLabelStyle, padding: "12px 12px 8px" }}>{workspaceName}</div>

          <button onClick={() => setActiveTab("workspace")} style={navItemStyle(activeTab === "workspace")}>Workspace</button>
          <button onClick={() => setActiveTab("members")} style={navItemStyle(activeTab === "members")}>Members</button>

          {/* User section */}
          <div style={sectionLabelStyle}>{displayName}</div>
          <button onClick={() => setActiveTab("profile")} style={navItemStyle(activeTab === "profile")}>Profile</button>

          {/* Computers */}
          {computers.length > 0 && (
            <>
              <div style={sectionLabelStyle}>Computers</div>
              {computers.map((c) => (
                <button key={c.id} onClick={() => setActiveTab(`computer:${c.id}`)} style={navItemStyle(activeTab === `computer:${c.id}`)}>
                  {c.name}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with close */}
          <div className="flex items-center justify-end" style={{ padding: "12px 16px 0" }}>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity" style={{ color: "var(--text-tertiary)", padding: "4px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto" style={{ padding: "4px 24px 24px" }}>
            {activeTab === "workspace" && (
              <WorkspacePanel workspaceName={workspaceName} workspaceId={workspaceId} workspaceIconUrl={workspaceIconUrl || null} apiKeys={apiKeys} onDeleteWorkspace={onDeleteWorkspace} onRenameWorkspace={onRenameWorkspace} onIconUploaded={onIconUploaded || (() => {})} />
            )}
            {activeTab === "members" && <MembersPanel />}
            {activeTab === "profile" && (
              <ProfilePanel displayName={displayName} email={email} plan={plan} initials={initials} />
            )}
            {activeTab.startsWith("computer:") && (() => {
              const cId = activeTab.replace("computer:", "");
              const computer = computers.find((c) => c.id === cId);
              if (!computer) return null;
              return (
                <ComputerPanel
                  computer={computer}
                  onDelete={() => { onDeleteComputer(computer.id); onClose(); }}
                  onRename={(name) => onRenameComputer(computer.id, name)}
                />
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

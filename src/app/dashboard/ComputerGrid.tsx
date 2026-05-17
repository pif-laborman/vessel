"use client";

import { useState, useEffect, useRef } from "react";

interface Computer {
  id: string;
  name: string;
  os: string;
  cpu: number;
  ram: number;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  running: "#03A97E",
  creating: "#B8860B",
  starting: "#B8860B",
  stopped: "#999999",
  terminated: "#999999",
  error: "#E53935",
  stopping: "#B8860B",
  restarting: "#B8860B",
};

function CreateComputerPopover({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Computer) => void }) {
  const [name, setName] = useState("MyComputer");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cpu, setCpu] = useState(1);
  const [ram, setRam] = useState(4);
  const [diskGb, setDiskGb] = useState(8);
  const [launching, setLaunching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  async function handleLaunch() {
    if (!name.trim() || launching) return;
    setLaunching(true);
    try {
      const res = await fetch("/api/computers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), cpu, ram, disk_size_gb: diskGb }),
      });
      const data = await res.json();
      if (data.id) {
        onCreated(data);
        onClose();
      }
    } finally {
      setLaunching(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLaunch();
    }
  }

  return (
    <div
      ref={popoverRef}
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        marginTop: "var(--space-2)",
        width: 320,
        background: "var(--bg-page)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        padding: "var(--space-4)",
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--space-3)" }}>
        <kbd
          style={{
            padding: "1px 6px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--text-tertiary)",
            background: "var(--bg-surface)",
          }}
        >
          N
        </kbd>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
          New computer
        </span>
      </div>

      {/* Name input */}
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Computer name"
        autoFocus
        style={{
          width: "100%",
          height: 40,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          padding: "0 var(--space-3)",
          fontSize: "var(--text-sm)",
          fontFamily: "var(--font-body)",
          color: "var(--text-primary)",
          outline: "none",
          marginBottom: "var(--space-3)",
        }}
      />

      {/* Launch button */}
      <button
        onClick={handleLaunch}
        disabled={launching || !name.trim()}
        className="btn-primary"
        style={{
          width: "100%",
          height: 40,
          opacity: launching || !name.trim() ? 0.5 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {launching ? "Launching..." : "Launch"}
        {!launching && (
          <kbd
            style={{
              padding: "0px 4px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(255,255,255,0.15)",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            ↵
          </kbd>
        )}
      </button>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1 w-full transition-colors"
        style={{
          marginTop: "var(--space-3)",
          fontSize: "var(--text-xs)",
          color: "var(--text-tertiary)",
          fontFamily: "var(--font-body)",
          padding: "2px 0",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: showAdvanced ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        Advanced
      </button>

      {/* Advanced options */}
      {showAdvanced && (
        <div style={{ marginTop: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {/* CPU */}
          <div className="flex items-center justify-between">
            <label style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>CPU</label>
            <select
              value={cpu}
              onChange={(e) => setCpu(Number(e.target.value))}
              style={{
                fontSize: "var(--text-xs)",
                fontFamily: "var(--font-mono)",
                padding: "4px 8px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "var(--bg-page)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            >
              {[1, 2, 4, 8, 16].map((v) => (
                <option key={v} value={v}>{v} vCPU</option>
              ))}
            </select>
          </div>

          {/* RAM */}
          <div className="flex items-center justify-between">
            <label style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>RAM</label>
            <select
              value={ram}
              onChange={(e) => setRam(Number(e.target.value))}
              style={{
                fontSize: "var(--text-xs)",
                fontFamily: "var(--font-mono)",
                padding: "4px 8px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "var(--bg-page)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            >
              {[4, 8, 16, 32, 64].map((v) => (
                <option key={v} value={v}>{v} GB</option>
              ))}
            </select>
          </div>

          {/* Disk */}
          <div className="flex items-center justify-between">
            <label style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Disk</label>
            <select
              value={diskGb}
              onChange={(e) => setDiskGb(Number(e.target.value))}
              style={{
                fontSize: "var(--text-xs)",
                fontFamily: "var(--font-mono)",
                padding: "4px 8px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "var(--bg-page)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            >
              {[8, 16, 32, 64, 128].map((v) => (
                <option key={v} value={v}>{v} GB</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

function NewComputerCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group transition-shadow hover:shadow-md"
      style={{
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-8) var(--space-4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-3)",
        cursor: "pointer",
        background: "var(--bg-page)",
        minHeight: 160,
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text-tertiary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="group-hover:opacity-70 transition-opacity"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <div className="flex items-center gap-2">
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          New Computer
        </span>
        <kbd style={{ padding: "0px 5px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>
          N
        </kbd>
      </div>
    </button>
  );
}

function ComputerCard({ computer, onClick }: { computer: Computer; onClick: () => void }) {
  const statusColor = STATUS_COLORS[computer.status] || "#999";

  return (
    <div
      onClick={onClick}
      className="card group transition-shadow hover:shadow-md cursor-pointer"
      style={{ padding: 0, overflow: "hidden", minHeight: 160 }}
    >
      <div
        className="flex items-center justify-center"
        style={{ height: 100, background: "var(--bg-warm)", borderBottom: "1px solid var(--border)" }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1" className="opacity-40">
          <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
        </svg>
      </div>
      <div style={{ padding: "var(--space-3) var(--space-4)" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-1)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
            {computer.name}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
            <span style={{ fontSize: "10px", color: statusColor }}>{computer.status}</span>
          </span>
        </div>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
          {computer.cpu} vCPU / {computer.ram} GB
        </span>
      </div>
    </div>
  );
}

function ComputerRow({ computer, onClick }: { computer: Computer; onClick: () => void }) {
  const statusColor = STATUS_COLORS[computer.status] || "#999";

  return (
    <div
      onClick={onClick}
      className="flex items-center hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
      style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" className="shrink-0" style={{ marginRight: "var(--space-3)" }}>
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
      </svg>
      <span className="flex-1" style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)" }}>
        {computer.name}
      </span>
      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", marginRight: "var(--space-6)" }}>
        {computer.cpu} vCPU / {computer.ram} GB
      </span>
      <span className="flex items-center gap-1.5" style={{ width: 80 }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
        <span style={{ fontSize: "var(--text-xs)", color: statusColor }}>{computer.status}</span>
      </span>
      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", width: 90, textAlign: "right" }}>
        {new Date(computer.created_at).toLocaleDateString()}
      </span>
    </div>
  );
}

export function ComputerGrid({
  computers: initialComputers,
  viewMode,
  onSelectComputer,
}: {
  computers: Computer[];
  viewMode: "grid" | "list";
  onSelectComputer?: (id: string, name: string) => void;
}) {
  const [computers, setComputers] = useState(initialComputers);
  const [showCreate, setShowCreate] = useState(false);

  // Keyboard shortcut: N to open create
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

  function handleCreated(computer: Computer) {
    setComputers((prev) => [computer, ...prev]);
  }

  if (viewMode === "list") {
    return (
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* New computer row */}
        <div className="relative">
          <div
            onClick={() => setShowCreate(true)}
            className="flex items-center hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
            style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" className="shrink-0" style={{ marginRight: "var(--space-3)" }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              New Computer
            </span>
            <kbd style={{ marginLeft: "var(--space-2)", padding: "0px 5px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>
              N
            </kbd>
          </div>
          {showCreate && (
            <CreateComputerPopover
              onClose={() => setShowCreate(false)}
              onCreated={handleCreated}
            />
          )}
        </div>
        {computers.map((c) => (
          <ComputerRow key={c.id} computer={c} onClick={() => onSelectComputer?.(c.id, c.name)} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
    >
      <div className="relative">
        <NewComputerCard onClick={() => setShowCreate(true)} />
        {showCreate && (
          <CreateComputerPopover
            onClose={() => setShowCreate(false)}
            onCreated={handleCreated}
          />
        )}
      </div>
      {computers.map((c) => (
        <ComputerCard key={c.id} computer={c} onClick={() => onSelectComputer?.(c.id, c.name)} />
      ))}
    </div>
  );
}

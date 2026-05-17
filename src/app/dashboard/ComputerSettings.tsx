"use client";

import { useState, useEffect, useRef } from "react";

interface Computer {
  id: string;
  name: string;
  os: string;
  cpu: number;
  ram: number;
  status: string;
  resolution?: string;
}

interface Props {
  computer: Computer;
  onClose: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 hover:opacity-70 transition-opacity"
      style={{ padding: "6px", borderRadius: "var(--radius-sm)", color: "var(--text-tertiary)" }}
      title="Copy"
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#03A97E" strokeWidth="2" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
      )}
    </button>
  );
}

export function ComputerSettings({ computer, onClose, onDelete, onRename }: Props) {
  const [name, setName] = useState(computer.name);
  const [saving, setSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const apiEndpoint = `https://meetpif.com/vessel-api/v1/computers/${computer.id}`;
  const resolution = computer.resolution || "1280 x 720";
  const resDisplay = resolution.includes("x") ? resolution.replace(/x/g, " x ").replace(/x24/i, "").trim() : "1280 x 720";

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  async function handleSaveName() {
    if (name.trim() === computer.name || !name.trim()) return;
    setSaving(true);
    try {
      onRename(name.trim());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg flex flex-col"
        style={{
          background: "var(--bg-page)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
          maxHeight: "80vh",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-base)" }}>
            Settings
          </span>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-tertiary)", padding: "4px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "20px" }}>
          {/* Computer Name */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-2)", fontFamily: "var(--font-display)" }}>
              Computer Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); }}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  padding: "0 var(--space-3)",
                  fontSize: "var(--text-sm)",
                  fontFamily: "var(--font-body)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Computer ID */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-2)", fontFamily: "var(--font-display)" }}>
              Computer ID
            </label>
            <div
              className="flex items-center"
              style={{
                height: 42,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                padding: "0 var(--space-3)",
                background: "var(--bg-surface)",
              }}
            >
              <span className="flex-1 truncate" style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                {computer.id}
              </span>
              <CopyButton value={computer.id} />
            </div>
          </div>

          {/* API Endpoint */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-2)", fontFamily: "var(--font-display)" }}>
              API Endpoint
            </label>
            <div
              className="flex items-center"
              style={{
                height: 42,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                padding: "0 var(--space-3)",
                background: "var(--bg-surface)",
              }}
            >
              <span className="flex-1 truncate" style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                {apiEndpoint}
              </span>
              <CopyButton value={apiEndpoint} />
            </div>
          </div>

          {/* Specs row */}
          <div className="flex gap-4" style={{ marginBottom: "var(--space-6)" }}>
            {/* Display */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5" style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-2)", fontFamily: "var(--font-display)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                </svg>
                Display
              </label>
              <span style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                {resDisplay}
              </span>
            </div>
            {/* CPU */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5" style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-2)", fontFamily: "var(--font-display)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
                </svg>
                CPU
              </label>
              <span style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                {computer.cpu} vCPU
              </span>
            </div>
            {/* RAM */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5" style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-2)", fontFamily: "var(--font-display)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M6 19v-3M10 19v-3M14 19v-3M18 19v-3M3 7h18M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l2-4h14l2 4" />
                </svg>
                RAM
              </label>
              <span style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                {computer.ram} GB
              </span>
            </div>
          </div>

          {/* Status */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <label className="flex items-center gap-1.5" style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-2)", fontFamily: "var(--font-display)" }}>
              Status
            </label>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: computer.status === "running" ? "#03A97E" : "#999" }} />
              <span style={{ fontSize: "var(--text-sm)", color: computer.status === "running" ? "#03A97E" : "var(--text-tertiary)", fontFamily: "var(--font-body)" }}>
                {computer.status}
              </span>
            </span>
          </div>
        </div>

        {/* Footer: delete */}
        <div
          className="flex items-center justify-between"
          style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}
        >
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            Permanently delete this computer.
          </span>
          <button
            onClick={() => { onDelete(); onClose(); }}
            className="hover:opacity-80 transition-opacity"
            style={{ fontSize: "var(--text-sm)", color: "var(--color-error)", fontFamily: "var(--font-display)", fontWeight: 500 }}
          >
            Delete computer
          </button>
        </div>
      </div>
    </div>
  );
}

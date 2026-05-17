"use client";

import { useState, useEffect, useRef } from "react";

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

export function CreateComputerPopover({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Computer) => void }) {
  const [name, setName] = useState("MyComputer");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cpu, setCpu] = useState(1);
  const [ram, setRam] = useState(4);
  const [diskGb, setDiskGb] = useState(8);
  const [launching, setLaunching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.select(); }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose();
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => { document.removeEventListener("mousedown", handleClickOutside); document.removeEventListener("keydown", handleEsc); };
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
      if (data.id) { onCreated(data); onClose(); }
    } finally { setLaunching(false); }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); handleLaunch(); }
  }

  const selectStyle = { fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", padding: "4px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-page)", color: "var(--text-primary)", outline: "none" };

  return (
    <div ref={popoverRef} style={{ position: "absolute", top: "100%", left: 0, marginTop: "var(--space-2)", width: 280, background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", padding: "var(--space-4)", zIndex: 50 }}>
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--space-3)" }}>
        <kbd style={{ padding: "1px 6px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)", background: "var(--bg-surface)" }}>N</kbd>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500 }}>New computer</span>
      </div>
      <input ref={inputRef} type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} placeholder="Computer name" autoFocus style={{ width: "100%", height: 40, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", padding: "0 var(--space-3)", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)", color: "var(--text-primary)", outline: "none", marginBottom: "var(--space-3)" }} />
      <button onClick={handleLaunch} disabled={launching || !name.trim()} className="btn-primary" style={{ width: "100%", height: 40, opacity: launching || !name.trim() ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        {launching ? "Launching..." : "Launch"}
        {!launching && <kbd style={{ padding: "0px 4px", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,0.15)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>↵</kbd>}
      </button>
      <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1 w-full transition-colors" style={{ marginTop: "var(--space-3)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-body)", padding: "2px 0" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showAdvanced ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}><path d="M9 18l6-6-6-6" /></svg>
        Advanced
      </button>
      {showAdvanced && (
        <div style={{ marginTop: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div className="flex items-center justify-between">
            <label style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>CPU</label>
            <select value={cpu} onChange={(e) => setCpu(Number(e.target.value))} style={selectStyle}>{[1, 2, 4, 8, 16].map((v) => <option key={v} value={v}>{v} vCPU</option>)}</select>
          </div>
          <div className="flex items-center justify-between">
            <label style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>RAM</label>
            <select value={ram} onChange={(e) => setRam(Number(e.target.value))} style={selectStyle}>{[4, 8, 16, 32, 64].map((v) => <option key={v} value={v}>{v} GB</option>)}</select>
          </div>
          <div className="flex items-center justify-between">
            <label style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Disk</label>
            <select value={diskGb} onChange={(e) => setDiskGb(Number(e.target.value))} style={selectStyle}>{[8, 16, 32, 64, 128].map((v) => <option key={v} value={v}>{v} GB</option>)}</select>
          </div>
        </div>
      )}
    </div>
  );
}

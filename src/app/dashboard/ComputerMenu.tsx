"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  computerId: string;
  computerName: string;
  onDelete: () => void;
  onRestart: () => void;
  onSettings: () => void;
}

export function ComputerMenu({ computerId, computerName, onDelete, onRestart, onSettings }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  // Keyboard shortcuts when menu is open
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "r" || e.key === "R") { e.preventDefault(); setOpen(false); onRestart(); }
      if (e.key === "d" || e.key === "D") { e.preventDefault(); setOpen(false); onDelete(); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onRestart, onDelete]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="hover:opacity-70 transition-opacity"
        style={{ color: "var(--text-tertiary)", fontSize: "var(--text-lg)", lineHeight: 1, padding: "4px 8px" }}
      >
        &#x2026;
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "4px",
            width: 200,
            background: "var(--bg-page)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            padding: "4px",
            zIndex: 50,
          }}
        >
          {/* Settings */}
          <button
            onClick={() => { setOpen(false); onSettings(); }}
            className="w-full flex items-center justify-between transition-colors"
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-body)",
              color: "var(--text-primary)",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-surface)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Settings
            </span>
            <kbd style={{ padding: "0px 5px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>S</kbd>
          </button>

          {/* Restart */}
          <button
            onClick={() => { setOpen(false); onRestart(); }}
            className="w-full flex items-center justify-between transition-colors"
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-body)",
              color: "var(--text-primary)",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-surface)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
              Restart
            </span>
            <kbd style={{ padding: "0px 5px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>R</kbd>
          </button>

          {/* Clone */}
          <button
            onClick={() => { setOpen(false); }}
            className="w-full flex items-center justify-between transition-colors"
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-body)",
              color: "var(--text-primary)",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-surface)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Clone
            </span>
            <kbd style={{ padding: "0px 5px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>C</kbd>
          </button>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

          {/* Delete */}
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center justify-between transition-colors"
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-body)",
              color: "var(--color-error)",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(229, 57, 53, 0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Delete
            </span>
            <span className="flex items-center gap-0.5">
              <kbd style={{ padding: "0px 4px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>&#x2318;</kbd>
              <kbd style={{ padding: "0px 5px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>D</kbd>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

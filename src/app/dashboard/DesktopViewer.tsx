"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  computerId: string;
  computerName: string;
  onClose: () => void;
  inline?: boolean;
}

export function DesktopViewer({ computerId, computerName, onClose, inline }: Props) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchScreenshot = useCallback(async () => {
    try {
      const res = await fetch(`/api/computers/${computerId}/screenshot`);
      if (!res.ok) { setError("Failed to capture screen"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setScreenshotUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
      setLoading(false);
      setError(null);
    } catch {
      setError("Connection lost");
    }
  }, [computerId]);

  useEffect(() => {
    fetchScreenshot();
    const interval = setInterval(fetchScreenshot, 1000);
    return () => { clearInterval(interval); };
  }, [fetchScreenshot]);

  async function handleClick(e: React.MouseEvent<HTMLImageElement>) {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    await fetch(`/api/computers/${computerId}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "click", x, y }),
    });
    setTimeout(fetchScreenshot, 300);
  }

  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" && !inline) { onClose(); return; }
    if (e.key === "Escape") return;
    e.preventDefault();

    if (e.key.length === 1) {
      await fetch(`/api/computers/${computerId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "type", text: e.key }),
      });
    } else {
      const keyMap: Record<string, string> = {
        Enter: "Return", Backspace: "BackSpace", Tab: "Tab",
        ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right",
        Delete: "Delete", Home: "Home", End: "End",
      };
      const xdoKey = keyMap[e.key];
      if (xdoKey) {
        await fetch(`/api/computers/${computerId}/actions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "key", key: xdoKey }),
        });
      }
    }
    setTimeout(fetchScreenshot, 200);
  }

  // Inline mode: fits within parent container
  if (inline) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{ padding: "16px" }}
      >
        {loading && !screenshotUrl ? (
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "var(--text-sm)" }}>Starting desktop...</div>
        ) : error && !screenshotUrl ? (
          <div style={{ color: "#E53935", fontSize: "var(--text-sm)" }}>{error}</div>
        ) : screenshotUrl ? (
          <img
            ref={imgRef}
            src={screenshotUrl}
            alt={computerName}
            onClick={handleClick}
            className="cursor-crosshair"
            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "var(--radius-md)", boxShadow: "0 0 40px rgba(0,0,0,0.3)", objectFit: "contain" }}
            draggable={false}
          />
        ) : null}
      </div>
    );
  }

  // Overlay mode (legacy)
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="shrink-0 flex items-center justify-between" style={{ padding: "8px 16px", background: "rgba(0,0,0,0.5)" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)", color: "white" }}>{computerName}</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: error ? "#E53935" : "#03A97E" }} />
            <span style={{ fontSize: "var(--text-xs)", color: error ? "#E53935" : "#03A97E" }}>{error ? "Disconnected" : "Connected"}</span>
          </span>
        </div>
        <button onClick={onClose} style={{ fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.6)" }} className="hover:opacity-80 transition-opacity flex items-center gap-1">
          <kbd style={{ padding: "0px 5px", borderRadius: "3px", border: "1px solid rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>Esc</kbd>
          Close
        </button>
      </div>
      <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-hidden" style={{ padding: "16px" }} tabIndex={0} onKeyDown={handleKeyDown}>
        {loading && !screenshotUrl ? (
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "var(--text-sm)" }}>Starting desktop...</div>
        ) : screenshotUrl ? (
          <img ref={imgRef} src={screenshotUrl} alt={computerName} onClick={handleClick} className="cursor-crosshair" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "var(--radius-md)", boxShadow: "0 0 60px rgba(0,0,0,0.5)", objectFit: "contain" }} draggable={false} />
        ) : null}
      </div>
    </div>
  );
}

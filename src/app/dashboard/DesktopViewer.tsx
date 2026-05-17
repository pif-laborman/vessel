"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  computerId: string;
  computerName: string;
  onClose: () => void;
}

export function DesktopViewer({ computerId, computerName, onClose }: Props) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Connecting...");
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchScreenshot = useCallback(async () => {
    try {
      const res = await fetch(`/api/computers/${computerId}/screenshot`);
      if (!res.ok) {
        setError("Failed to capture screen");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setScreenshotUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setLoading(false);
      setError(null);
      setStatus("Connected");
    } catch {
      setError("Connection lost");
      setStatus("Disconnected");
    }
  }, [computerId]);

  // Poll screenshots
  useEffect(() => {
    fetchScreenshot();
    intervalRef.current = setInterval(fetchScreenshot, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    };
  }, [fetchScreenshot]);

  // Keyboard: Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Translate click on screenshot to desktop coordinates
  async function handleClick(e: React.MouseEvent<HTMLImageElement>) {
    const img = imgRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    setStatus(`Click (${x}, ${y})`);

    await fetch(`/api/computers/${computerId}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "click", x, y }),
    });

    // Refresh screenshot immediately after click
    setTimeout(fetchScreenshot, 300);
  }

  // Handle keyboard input when viewer is focused
  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") return;
    e.preventDefault();

    if (e.key.length === 1) {
      // Printable character
      await fetch(`/api/computers/${computerId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "type", text: e.key }),
      });
    } else {
      // Special key
      const keyMap: Record<string, string> = {
        Enter: "Return",
        Backspace: "BackSpace",
        Tab: "Tab",
        ArrowUp: "Up",
        ArrowDown: "Down",
        ArrowLeft: "Left",
        ArrowRight: "Right",
        Delete: "Delete",
        Home: "Home",
        End: "End",
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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      {/* Top bar */}
      <div
        className="shrink-0 flex items-center justify-between"
        style={{ padding: "8px 16px", background: "rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)", color: "white" }}>
            {computerName}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: error ? "#E53935" : "#03A97E" }}
            />
            <span style={{ fontSize: "var(--text-xs)", color: error ? "#E53935" : "#03A97E" }}>
              {status}
            </span>
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}
          className="hover:opacity-80 transition-opacity flex items-center gap-1"
        >
          <kbd style={{ padding: "0px 5px", borderRadius: "3px", border: "1px solid rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
            Esc
          </kbd>
          Close
        </button>
      </div>

      {/* Desktop view */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden"
        style={{ padding: "16px" }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {loading && !screenshotUrl ? (
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "var(--text-sm)" }}>
            Starting desktop...
          </div>
        ) : error && !screenshotUrl ? (
          <div style={{ color: "#E53935", fontSize: "var(--text-sm)" }}>
            {error}
          </div>
        ) : screenshotUrl ? (
          <img
            ref={imgRef}
            src={screenshotUrl}
            alt="Desktop"
            onClick={handleClick}
            className="cursor-crosshair"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              borderRadius: "var(--radius-md)",
              boxShadow: "0 0 60px rgba(0,0,0,0.5)",
              objectFit: "contain",
            }}
            draggable={false}
          />
        ) : null}
      </div>
    </div>
  );
}

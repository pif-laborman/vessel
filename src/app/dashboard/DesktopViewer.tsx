"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  computerId: string;
  computerName: string;
  hostname?: string | null;
  onClose: () => void;
  inline?: boolean;
}

const VNC_PORT_OFFSET = 100;

function getVncUrl(hostname?: string | null): string {
  const agentPort = hostname ? parseInt(hostname.split(":")[1] || "10000", 10) : 10000;
  const vncPort = agentPort + VNC_PORT_OFFSET;
  return `https://compute.corix.dev/vnc/${vncPort}/vnc_lite.html?autoconnect=true&resize=scale&reconnect=true&path=vnc/${vncPort}/`;
}

export function DesktopViewer({ computerId, computerName, hostname, onClose, inline }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const vncUrl = getVncUrl(hostname);

  useEffect(() => {
    // Timeout for loading
    const timeout = setTimeout(() => {
      if (loading) setError("Desktop is taking longer than expected to connect...");
    }, 15000);
    return () => clearTimeout(timeout);
  }, [loading]);

  // Inline mode
  if (inline) {
    return (
      <div className="w-full h-full flex flex-col outline-none" style={{ background: "#0a0a0f" }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: "#0a0a0f" }}>
            <div className="text-center">
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "var(--text-sm)", marginBottom: 8 }}>Connecting to desktop...</div>
              {error && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "var(--text-xs)" }}>{error}</div>}
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={vncUrl}
          className="w-full h-full border-0"
          style={{ borderRadius: "var(--radius-sm)" }}
          onLoad={() => setLoading(false)}
          allow="clipboard-read; clipboard-write"
        />
      </div>
    );
  }

  // Overlay mode
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="shrink-0 flex items-center justify-between" style={{ padding: "8px 16px", background: "rgba(0,0,0,0.5)" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)", color: "white" }}>{computerName}</span>
        <button onClick={onClose} style={{ fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.6)" }} className="hover:opacity-80 transition-opacity">
          Close
        </button>
      </div>
      <div className="flex-1 overflow-hidden" style={{ padding: "8px" }}>
        <iframe
          ref={iframeRef}
          src={vncUrl}
          className="w-full h-full border-0"
          style={{ borderRadius: "var(--radius-md)" }}
          onLoad={() => setLoading(false)}
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}

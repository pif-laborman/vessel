"use client";

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

function NewComputerCard() {
  return (
    <button
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
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)",
          }}
        >
          New Computer
        </span>
        <kbd
          style={{
            padding: "0px 5px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--text-tertiary)",
          }}
        >
          N
        </kbd>
      </div>
    </button>
  );
}

function ComputerCard({ computer }: { computer: Computer }) {
  const statusColor = STATUS_COLORS[computer.status] || "#999";

  return (
    <div
      className="card group transition-shadow hover:shadow-md cursor-pointer"
      style={{ padding: 0, overflow: "hidden", minHeight: 160 }}
    >
      {/* Preview area */}
      <div
        className="flex items-center justify-center"
        style={{
          height: 100,
          background: "var(--bg-warm)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-tertiary)"
          strokeWidth="1"
          className="opacity-40"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      </div>

      {/* Info */}
      <div style={{ padding: "var(--space-3) var(--space-4)" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-1)" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "var(--text-sm)",
              color: "var(--text-primary)",
            }}
          >
            {computer.name}
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: statusColor }}
            />
            <span style={{ fontSize: "10px", color: statusColor }}>
              {computer.status}
            </span>
          </span>
        </div>
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {computer.cpu} vCPU / {computer.ram} GB
        </span>
      </div>
    </div>
  );
}

function ComputerRow({ computer }: { computer: Computer }) {
  const statusColor = STATUS_COLORS[computer.status] || "#999";

  return (
    <div
      className="flex items-center hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
      style={{
        padding: "10px 16px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" className="shrink-0" style={{ marginRight: "var(--space-3)" }}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
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
  computers,
  viewMode,
}: {
  computers: Computer[];
  viewMode: "grid" | "list";
}) {
  if (viewMode === "list") {
    return (
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* New computer row */}
        <div
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
        {computers.map((c) => (
          <ComputerRow key={c.id} computer={c} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
    >
      <NewComputerCard />
      {computers.map((c) => (
        <ComputerCard key={c.id} computer={c} />
      ))}
    </div>
  );
}

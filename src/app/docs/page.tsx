import Link from "next/link";

const sections = [
  {
    title: "Getting started",
    items: [
      { label: "Introduction", href: "#introduction" },
      { label: "Quickstart", href: "#quickstart" },
      { label: "Authentication", href: "#authentication" },
    ],
  },
  {
    title: "Core concepts",
    items: [
      { label: "Computer object", href: "#computer-object" },
      { label: "Workspace object", href: "#workspace-object" },
      { label: "The agent loop", href: "#agent-loop" },
    ],
  },
  {
    title: "Workspaces",
    items: [
      { label: "Create workspace", href: "#create-workspace" },
      { label: "Get workspace", href: "#get-workspace" },
      { label: "List workspaces", href: "#list-workspaces" },
      { label: "Delete workspace", href: "#delete-workspace" },
    ],
  },
  {
    title: "Computers",
    items: [
      { label: "Create computer", href: "#create-computer" },
      { label: "Get computer", href: "#get-computer" },
      { label: "List computers", href: "#list-computers" },
      { label: "Delete computer", href: "#delete-computer" },
      { label: "Clone computer", href: "#clone-computer" },
      { label: "Resize computer", href: "#resize-computer" },
      { label: "Move computer", href: "#move-computer" },
    ],
  },
  {
    title: "Lifecycle",
    items: [
      { label: "Start", href: "#start-computer" },
      { label: "Stop", href: "#stop-computer" },
      { label: "Restart", href: "#restart-computer" },
      { label: "Auto-stop", href: "#auto-stop" },
    ],
  },
  {
    title: "Actions",
    items: [
      { label: "Screenshot", href: "#screenshot" },
      { label: "Click", href: "#action-click" },
      { label: "Drag", href: "#action-drag" },
      { label: "Type", href: "#action-type" },
      { label: "Key press", href: "#action-key" },
      { label: "Scroll", href: "#action-scroll" },
      { label: "Wait", href: "#action-wait" },
      { label: "Execute bash", href: "#execute-bash" },
      { label: "Execute Python", href: "#execute-python" },
    ],
  },
  {
    title: "Files",
    items: [
      { label: "List files", href: "#list-files" },
      { label: "Upload file", href: "#upload-file" },
      { label: "Download file", href: "#download-file" },
      { label: "Delete file", href: "#delete-file" },
    ],
  },
  {
    title: "Streaming",
    items: [
      { label: "WebSocket terminal", href: "#ws-terminal" },
    ],
  },
  {
    title: "Errors",
    items: [
      { label: "Error codes", href: "#error-codes" },
      { label: "Rate limits", href: "#rate-limits" },
    ],
  },
  {
    title: "SDKs",
    items: [
      { label: "Python", href: "#python-sdk" },
      { label: "TypeScript", href: "#typescript-sdk" },
    ],
  },
];

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--border)", marginTop: "var(--space-4)", marginBottom: "var(--space-4)", overflow: "hidden" }}>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{title}</span>
      </div>
      <pre style={{ padding: "var(--space-4)", fontSize: "var(--text-sm)", lineHeight: 1.6, fontFamily: "var(--font-mono)", background: "var(--bg-page)", overflowX: "auto", color: "var(--text-primary)" }}>
        {code}
      </pre>
    </div>
  );
}

function Endpoint({ method, path }: { method: string; path: string }) {
  const colors: Record<string, string> = { GET: "#03A97E", POST: "#2563EB", DELETE: "#E53935", PATCH: "#B8860B" };
  return (
    <code style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", background: "var(--bg-surface)", padding: "2px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
      <span style={{ color: colors[method] || "var(--text-primary)", fontWeight: 500 }}>{method}</span>
      <span style={{ color: "var(--text-primary)" }}>{path}</span>
    </code>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)", marginTop: "var(--space-12)", paddingTop: "var(--space-8)", borderTop: "1px solid var(--border)" }}>
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-base)", lineHeight: 1.7, marginBottom: "var(--space-4)" }}>{children}</p>;
}

export default function DocsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}>
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2" style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-sm)" }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--fill-action)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            Corix
          </Link>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginLeft: "var(--space-2)" }}>Docs</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 flex gap-12" style={{ paddingTop: 80 }}>
        <aside className="hidden lg:block w-48 shrink-0 sticky top-20 self-start overflow-y-auto" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-8)", maxHeight: "calc(100vh - 5rem)" }}>
          {sections.map((section) => (
            <div key={section.title} style={{ marginBottom: "var(--space-6)" }}>
              <h4 style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-2)", fontFamily: "var(--font-display)" }}>{section.title}</h4>
              <ul>
                {section.items.map((item) => (
                  <li key={item.href}><a href={item.href} className="block hover:opacity-70 transition-opacity" style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", padding: "2px 0" }}>{item.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <main className="flex-1 min-w-0" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)" }}>
          <h1 id="introduction" style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-3xl)", letterSpacing: "-0.02em", marginBottom: "var(--space-4)" }}>Introduction</h1>
          <P>Corix provides cloud-based desktop infrastructure for AI agents. Spin up a virtual machine, connect any AI model, and let it autonomously control the computer through screenshots, mouse clicks, keyboard input, and shell commands.</P>
          <P>Corix is a plain HTTP API. Any language with an HTTP client works. We also provide Python and TypeScript SDKs.</P>
          <P>Base URL: <code style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", background: "var(--bg-surface)", padding: "2px 6px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>https://corix.dev/api</code></P>

          <SectionTitle id="quickstart">Quickstart</SectionTitle>
          <P>Get a computer running in three lines of code:</P>
          <CodeBlock title="Python" code={`import corix

computer = corix.create(os="linux", cpu=2, ram="8gb")
result = computer.prompt(
    model="claude-sonnet-4-6",
    task="Open the browser and search for 'Corix AI'"
)
print(result.output)`} />
          <CodeBlock title="cURL" code={`# Create a computer
curl -X POST https://corix.dev/api/v1/computers \\
  -H "Authorization: Bearer vsl_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my-agent", "cpu": 2, "ram": 4}'

# Take a screenshot
curl https://corix.dev/api/v1/computers/{id}/screenshot \\
  -H "Authorization: Bearer vsl_your_api_key" \\
  --output screenshot.png`} />

          <SectionTitle id="authentication">Authentication</SectionTitle>
          <P>All API requests require a Bearer token. Get your API key from the dashboard.</P>
          <CodeBlock title="Header" code={`Authorization: Bearer vsl_your_api_key`} />

          <SectionTitle id="computer-object">Computer object</SectionTitle>
          <P>A computer is a virtual machine with a full Linux desktop (XFCE), Firefox, Python, Node.js, and git.</P>
          <CodeBlock title="Computer object" code={`{
  "id": "ee5e84e7-dbaa-4730-884a-33866530d34f",
  "workspace_id": "b3aa1e63-e9b2-4fd5-9345-3b07ba7668dd",
  "user_id": "2812ea8d-ab93-436e-aa9d-7cb13ec7d42a",
  "name": "my-agent",
  "os": "linux",
  "cpu": 2,                    // 1, 2, 4, 8, 16
  "ram": 8,                    // 4, 8, 16, 32, 64 (GB)
  "disk_size_gb": 8,
  "resolution": "1280x720x24",
  "status": "running",         // creating | starting | running | stopping | stopped | restarting | terminated | error
  "container_id": "090fdc1ddd50",
  "hostname": "127.0.0.1:10000",
  "auto_stop_minutes": null,   // null = disabled, number = minutes of inactivity
  "created_at": "2026-05-17T12:00:00Z",
  "updated_at": "2026-05-17T12:00:00Z",
  "terminated_at": null
}`} />

          <SectionTitle id="workspace-object">Workspace object</SectionTitle>
          <P>Workspaces group computers together. Each user starts with a default workspace.</P>
          <CodeBlock title="Workspace object" code={`{
  "id": "b3aa1e63-e9b2-4fd5-9345-3b07ba7668dd",
  "user_id": "2812ea8d-ab93-436e-aa9d-7cb13ec7d42a",
  "name": "Production",
  "status": "active",          // active | inactive
  "icon_url": null,            // uploaded workspace icon
  "created_at": "2026-05-17T12:00:00Z",
  "updated_at": "2026-05-17T12:00:00Z"
}`} />

          <SectionTitle id="agent-loop">The agent loop</SectionTitle>
          <P>AI agents operate on computers in a cycle: <strong>See</strong> (screenshot), <strong>Decide</strong> (model inference), <strong>Act</strong> (click/type/execute), <strong>Repeat</strong>. The SDK handles this loop automatically with <code style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", background: "var(--bg-surface)", padding: "2px 6px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>computer.prompt()</code>.</P>

          {/* Workspaces API */}
          <SectionTitle id="create-workspace">Create workspace</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/workspaces" /></p>
          <CodeBlock title="Request" code={`{ "name": "Production" }`} />
          <CodeBlock title="Response (201)" code={`{
  "id": "b3aa1e63-e9b2-4fd5-9345-3b07ba7668dd",
  "user_id": "2812ea8d-ab93-436e-aa9d-7cb13ec7d42a",
  "name": "Production",
  "status": "active",
  "created_at": "2026-05-17T12:00:00Z"
}`} />

          <SectionTitle id="get-workspace">Get workspace</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="GET" path="/v1/workspaces/:id" /></p>
          <P>Returns full details for a single workspace.</P>

          <SectionTitle id="list-workspaces">List workspaces</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="GET" path="/v1/workspaces" /></p>
          <CodeBlock title="Response" code={`{
  "workspaces": [
    { "id": "...", "name": "Default", "status": "active", "created_at": "..." },
    { "id": "...", "name": "Production", "status": "active", "created_at": "..." }
  ]
}`} />

          <SectionTitle id="delete-workspace">Delete workspace</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="DELETE" path="/v1/workspaces/:id" /></p>
          <P>Permanently deletes the workspace and terminates all its computers.</P>

          {/* Computers API */}
          <SectionTitle id="create-computer">Create computer</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers" /></p>
          <CodeBlock title="Request" code={`{
  "name": "my-agent",
  "cpu": 2,        // 1, 2, 4, 8, or 16
  "ram": 8,        // 4, 8, 16, 32, or 64 (GB)
  "disk_size_gb": 8,
  "workspace_id": "optional, uses default if omitted"
}`} />
          <CodeBlock title="Response (201)" code={`{
  "id": "ee5e84e7-dbaa-4730-884a-33866530d34f",
  "workspace_id": "b3aa1e63-e9b2-4fd5-9345-3b07ba7668dd",
  "name": "my-agent",
  "os": "linux",
  "cpu": 2,
  "ram": 8,
  "status": "running",
  "container_id": "090fdc1ddd50",
  "created_at": "2026-05-17T12:00:00Z"
}`} />

          <SectionTitle id="get-computer">Get computer</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="GET" path="/v1/computers/:id" /></p>
          <P>Returns full details for a single computer.</P>

          <SectionTitle id="list-computers">List computers</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="GET" path="/v1/computers" /></p>
          <P>Returns all non-terminated computers for the authenticated user.</P>
          <CodeBlock title="Response" code={`{
  "computers": [ ... ],
  "total": 2
}`} />

          <SectionTitle id="delete-computer">Delete computer</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="DELETE" path="/v1/computers/:id" /></p>
          <P>Stops the container and permanently removes the computer.</P>

          <SectionTitle id="clone-computer">Clone computer</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/clone" /></p>
          <P>Creates a new computer with the same specs. Does not copy filesystem state.</P>
          <CodeBlock title="Request" code={`{ "name": "my-agent-copy" }  // optional, defaults to "{name} (copy)"`} />

          <SectionTitle id="resize-computer">Resize computer</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/resize" /></p>
          <P>Live-resize CPU and/or RAM without restarting the computer.</P>
          <CodeBlock title="Request" code={`{ "cpu": 2, "ram": 8 }  // provide one or both`} />

          <SectionTitle id="move-computer">Move computer</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/move" /></p>
          <P>Move a computer to a different workspace.</P>
          <CodeBlock title="Request" code={`{ "workspace_id": "target-workspace-uuid" }`} />

          {/* Lifecycle */}
          <SectionTitle id="start-computer">Start computer</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/start" /></p>
          <P>Starts a stopped computer. Filesystem is preserved from the previous session.</P>

          <SectionTitle id="stop-computer">Stop computer</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/stop" /></p>
          <P>Stops the computer without deleting it. Running processes are terminated but the filesystem is preserved.</P>

          <SectionTitle id="restart-computer">Restart computer</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/restart" /></p>
          <P>Reboots the computer. Filesystem is preserved, all running processes are terminated, and a fresh desktop session starts.</P>

          {/* Actions */}
          <SectionTitle id="auto-stop">Auto-stop</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="GET" path="/v1/computers/:id/auto-stop" /></p>
          <P>Get the current auto-stop configuration.</P>
          <CodeBlock title="Response" code={`{ "auto_stop_minutes": 30 }  // null = disabled`} />
          <p style={{ marginBottom: "var(--space-3)", marginTop: "var(--space-4)" }}><Endpoint method="PATCH" path="/v1/computers/:id/auto-stop" /></p>
          <P>Set or disable auto-stop. The computer will automatically stop after the specified minutes of inactivity. Set to 0 to disable.</P>
          <CodeBlock title="Request" code={`{ "minutes": 30 }   // 0 to disable`} />

          {/* Actions */}
          <SectionTitle id="screenshot">Screenshot</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="GET" path="/v1/computers/:id/screenshot" /></p>
          <P>Returns the current desktop. Default response is a raw PNG image. Add <code style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", background: "var(--bg-surface)", padding: "2px 6px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>?format=base64</code> for a JSON response with embedded image data.</P>
          <CodeBlock title="Raw PNG (default)" code={`GET /v1/computers/:id/screenshot
// Response: binary PNG image (1280x720)`} />
          <CodeBlock title="Base64 JSON (?format=base64)" code={`{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KGgo...",
  "metadata": {
    "width": 1280,
    "height": 720,
    "format": "png",
    "size": 25203,
    "timestamp": "2026-05-17T12:00:00Z"
  }
}`} />

          <SectionTitle id="action-click">Click</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/click" /></p>
          <CodeBlock title="Request" code={`{ "x": 500, "y": 300, "button": "left" }
// button: "left" (default), "right", "middle"
// double_click: true for double-click`} />

          <SectionTitle id="action-drag">Drag</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/drag" /></p>
          <CodeBlock title="Request" code={`{ "start_x": 100, "start_y": 200, "end_x": 400, "end_y": 300, "button": "left" }`} />

          <SectionTitle id="action-type">Type text</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/type" /></p>
          <CodeBlock title="Request" code={`{ "text": "Hello from Corix" }`} />

          <SectionTitle id="action-key">Key press</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/key" /></p>
          <CodeBlock title="Request" code={`{ "key": "Return" }
// Keys: Return, BackSpace, Tab, Up, Down, Left, Right, Delete, Home, End, space, ctrl+c, alt+F4`} />

          <SectionTitle id="action-scroll">Scroll</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/scroll" /></p>
          <CodeBlock title="Request" code={`{ "x": 500, "y": 300, "direction": "down", "amount": 3 }
// direction: "up" or "down"`} />

          <SectionTitle id="action-wait">Wait</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/wait" /></p>
          <P>Pause for a specified duration (max 30 seconds). Useful in agent loops between actions.</P>
          <CodeBlock title="Request" code={`{ "seconds": 2 }`} />

          <SectionTitle id="execute-bash">Execute bash</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/bash" /></p>
          <CodeBlock title="Request" code={`{ "command": "ls -la /home" }`} />
          <CodeBlock title="Response" code={`{
  "stdout": "total 4\\ndrwxr-xr-x 2 root root 4096 May 17 12:00 .\\n",
  "stderr": "",
  "exit_code": 0
}`} />

          <SectionTitle id="execute-python">Execute Python</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/python" /></p>
          <CodeBlock title="Request" code={`{ "code": "import sys\\nprint(sys.version)" }`} />
          <CodeBlock title="Response" code={`{
  "stdout": "3.11.2 (main, Mar 13 2023, 12:18:29) [GCC 12.2.0]\\n",
  "stderr": "",
  "exit_code": 0
}`} />

          {/* Files */}
          <SectionTitle id="list-files">List files</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="GET" path="/v1/computers/:id/files?path=/root" /></p>
          <P>List files and directories at the given path inside the computer.</P>
          <CodeBlock title="Response" code={`{
  "path": "/root",
  "entries": [
    { "name": "Documents", "type": "directory", "size": 0 },
    { "name": "hello.py", "type": "file", "size": 142 }
  ]
}`} />

          <SectionTitle id="upload-file">Upload file</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="POST" path="/v1/computers/:id/files/upload?path=/root/data.csv" /></p>
          <P>Upload a file to the specified path inside the computer. Send the raw file content as the request body.</P>
          <CodeBlock title="cURL example" code={`curl -X POST "https://corix.dev/api/v1/computers/{id}/files/upload?path=/root/data.csv" \\
  -H "Authorization: Bearer vsl_your_api_key" \\
  --data-binary @local_file.csv`} />

          <SectionTitle id="download-file">Download file</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="GET" path="/v1/computers/:id/files/download?path=/root/output.txt" /></p>
          <P>Download a file from the computer. Returns raw binary content with Content-Disposition header. Max 50MB.</P>

          <SectionTitle id="delete-file">Delete file</SectionTitle>
          <p style={{ marginBottom: "var(--space-3)" }}><Endpoint method="DELETE" path="/v1/computers/:id/files?path=/root/temp.txt" /></p>
          <P>Delete a file inside the computer.</P>

          {/* Streaming */}
          <SectionTitle id="ws-terminal">WebSocket terminal</SectionTitle>
          <P>Connect to a real-time interactive shell session via WebSocket. The connection stays open for bidirectional I/O.</P>
          <CodeBlock title="Endpoint" code={`wss://meetpif.com/corix-ws/terminal/:computerId?token=vsl_your_api_key`} />
          <P>Send JSON messages to write to stdin:</P>
          <CodeBlock title="Client to server" code={`{ "type": "stdin", "data": "ls -la\\n" }`} />
          <P>Receive JSON messages with stdout, stderr, and exit events:</P>
          <CodeBlock title="Server to client" code={`{ "type": "stdout", "data": "total 4\\ndrwxr-xr-x 2 root root 4096 ..." }
{ "type": "stderr", "data": "command not found" }
{ "type": "exit", "code": 0 }`} />
          <CodeBlock title="JavaScript example" code={`const ws = new WebSocket(
  "wss://meetpif.com/corix-ws/terminal/" + computerId + "?token=" + apiKey
);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "stdout") process.stdout.write(msg.data);
  if (msg.type === "stderr") process.stderr.write(msg.data);
};

// Send a command
ws.send(JSON.stringify({ type: "stdin", data: "echo hello\\n" }));`} />

          {/* Errors */}
          <SectionTitle id="error-codes">Error codes</SectionTitle>
          <P>All errors return JSON with an <code style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", background: "var(--bg-surface)", padding: "2px 6px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>error</code> field.</P>
          <div className="card" style={{ marginBottom: "var(--space-4)", overflowX: "auto" }}>
            <table className="w-full" style={{ fontSize: "var(--text-sm)" }}>
              <thead><tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-tertiary)" }}>
                <th style={{ padding: "8px 0", fontWeight: 500 }}>Status</th>
                <th style={{ padding: "8px 0", fontWeight: 500 }}>Meaning</th>
              </tr></thead>
              <tbody style={{ color: "var(--text-secondary)" }}>
                <tr style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "6px 0", fontFamily: "var(--font-mono)" }}>200</td><td style={{ padding: "6px 0" }}>Success</td></tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "6px 0", fontFamily: "var(--font-mono)" }}>201</td><td style={{ padding: "6px 0" }}>Created</td></tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "6px 0", fontFamily: "var(--font-mono)" }}>400</td><td style={{ padding: "6px 0" }}>Bad request (missing or invalid parameters)</td></tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "6px 0", fontFamily: "var(--font-mono)" }}>401</td><td style={{ padding: "6px 0" }}>Unauthorized (missing or invalid API key)</td></tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "6px 0", fontFamily: "var(--font-mono)" }}>403</td><td style={{ padding: "6px 0" }}>Forbidden (plan limit reached, wrong owner)</td></tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "6px 0", fontFamily: "var(--font-mono)" }}>404</td><td style={{ padding: "6px 0" }}>Not found (computer or workspace does not exist)</td></tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "6px 0", fontFamily: "var(--font-mono)" }}>409</td><td style={{ padding: "6px 0" }}>Conflict (duplicate workspace name)</td></tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "6px 0", fontFamily: "var(--font-mono)" }}>429</td><td style={{ padding: "6px 0" }}>Rate limited</td></tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "6px 0", fontFamily: "var(--font-mono)" }}>500</td><td style={{ padding: "6px 0" }}>Internal server error</td></tr>
                <tr><td style={{ padding: "6px 0", fontFamily: "var(--font-mono)" }}>502</td><td style={{ padding: "6px 0" }}>Agent unreachable (computer may be starting)</td></tr>
              </tbody>
            </table>
          </div>
          <CodeBlock title="Error response shape" code={`{ "error": "Computer not found" }`} />

          <SectionTitle id="rate-limits">Rate limits</SectionTitle>
          <P>API requests are rate-limited per API key. Current limits by plan:</P>
          <div className="card" style={{ marginBottom: "var(--space-4)", overflowX: "auto" }}>
            <table className="w-full" style={{ fontSize: "var(--text-sm)" }}>
              <thead><tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-tertiary)" }}>
                <th style={{ padding: "8px 0", fontWeight: 500 }}>Plan</th>
                <th style={{ padding: "8px 0", fontWeight: 500 }}>API calls/day</th>
                <th style={{ padding: "8px 0", fontWeight: 500 }}>Max computers</th>
                <th style={{ padding: "8px 0", fontWeight: 500 }}>Max CPU</th>
                <th style={{ padding: "8px 0", fontWeight: 500 }}>Max RAM</th>
              </tr></thead>
              <tbody style={{ color: "var(--text-secondary)" }}>
                <tr style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "6px 0" }}>Starter</td><td style={{ padding: "6px 0" }}>1,000</td><td style={{ padding: "6px 0" }}>2</td><td style={{ padding: "6px 0" }}>1 vCPU</td><td style={{ padding: "6px 0" }}>4 GB</td></tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "6px 0" }}>Pro</td><td style={{ padding: "6px 0" }}>Unlimited</td><td style={{ padding: "6px 0" }}>20</td><td style={{ padding: "6px 0" }}>4 vCPU</td><td style={{ padding: "6px 0" }}>16 GB</td></tr>
                <tr><td style={{ padding: "6px 0" }}>Scale</td><td style={{ padding: "6px 0" }}>Unlimited</td><td style={{ padding: "6px 0" }}>100</td><td style={{ padding: "6px 0" }}>8 vCPU</td><td style={{ padding: "6px 0" }}>32 GB</td></tr>
              </tbody>
            </table>
          </div>
          <P>When rate limited, the API returns 429. Use exponential backoff (start at 1s, double each retry, max 60s).</P>

          {/* SDKs */}
          <SectionTitle id="python-sdk">Python SDK</SectionTitle>
          <CodeBlock title="Install" code={`pip install corix-sdk`} />
          <CodeBlock title="Usage" code={`import corix

client = corix.Client(api_key="vsl_your_api_key")
computer = client.computers.create(name="my-agent", cpu=2, ram=8)

# Autonomous agent mode
result = computer.prompt(
    model="claude-sonnet-4-6",
    task="Download the CSV from example.com and summarize it"
)

# Manual control
screenshot = computer.screenshot()
computer.click(500, 300)
computer.type("Hello")
output = computer.bash("cat /tmp/data.csv")
py_output = computer.python("import os; print(os.listdir('/'))")

# Lifecycle
computer.stop()
computer.start()
computer.restart()
computer.terminate()`} />

          <SectionTitle id="typescript-sdk">TypeScript SDK</SectionTitle>
          <CodeBlock title="Install" code={`npm install @corix/sdk`} />
          <CodeBlock title="Usage" code={`import { Corix } from "@corix/sdk";

const client = new Corix({ apiKey: "vsl_your_api_key" });
const computer = await client.computers.create({
  name: "my-agent", cpu: 2, ram: 8,
});

const result = await computer.prompt({
  model: "claude-sonnet-4-6",
  task: "Open Firefox and screenshot the homepage",
});

await computer.click(500, 300);
await computer.type("Hello from Corix");
const output = await computer.bash("ls -la");
const pyOutput = await computer.python("print('hello')");

await computer.stop();
await computer.start();
await computer.terminate();`} />
        </main>
      </div>
    </div>
  );
}

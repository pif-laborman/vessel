const { WebSocketServer } = require("ws");
const { spawn } = require("child_process");
const http = require("http");
const crypto = require("crypto");

const PORT = 8423;
const SUPABASE_URL = process.env.CORIX_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.CORIX_SUPABASE_SERVICE_KEY || "";
const INTERNAL_TOKEN = process.env.CORIX_INTERNAL_TOKEN || "vsl-internal-mvp-2026";

// Verify API key or internal token, return userId
async function verifyAuth(token) {
  if (!token) return null;

  // Internal token
  if (token === INTERNAL_TOKEN) return "internal";

  // vsl_ API key
  if (!token.startsWith("vsl_")) return null;
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/api_keys?key_hash=eq.${hash}&revoked_at=is.null&select=user_id`,
      { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } }
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data[0].user_id;
  } catch {}
  return null;
}

// Get container ID from computer ID
async function getContainerId(computerId, userId) {
  const filter = userId === "internal" ? "" : `&user_id=eq.${userId}`;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/computers?id=eq.${computerId}${filter}&select=container_id`,
      { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } }
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].container_id) return data[0].container_id;
  } catch {}
  return null;
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify({ status: "ok", service: "corix-ws-terminal" }));
});

const wss = new WebSocketServer({ server });

wss.on("connection", async (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Expected URL: /terminal/:computerId?token=<api_key_or_internal>
  const match = url.pathname.match(/^\/terminal\/([^/]+)$/);
  if (!match) {
    ws.close(4000, "Invalid path. Use /terminal/:computerId");
    return;
  }

  const computerId = match[1];
  const token = url.searchParams.get("token") || "";
  const userIdHeader = url.searchParams.get("user_id") || "";

  // Auth
  let userId = await verifyAuth(token);
  if (userId === "internal" && userIdHeader) userId = userIdHeader;
  if (!userId) {
    ws.close(4001, "Unauthorized");
    return;
  }

  // Resolve container
  const containerId = await getContainerId(computerId, userId);
  if (!containerId) {
    ws.close(4004, "Computer not found");
    return;
  }

  // Spawn docker exec with interactive bash
  const proc = spawn("docker", ["exec", "-i", "-e", "TERM=xterm-256color", "-e", "DISPLAY=:99", containerId, "/bin/bash"], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  let alive = true;

  proc.stdout.on("data", (data) => {
    if (alive && ws.readyState === 1) ws.send(JSON.stringify({ type: "stdout", data: data.toString() }));
  });

  proc.stderr.on("data", (data) => {
    if (alive && ws.readyState === 1) ws.send(JSON.stringify({ type: "stderr", data: data.toString() }));
  });

  proc.on("close", (code) => {
    alive = false;
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "exit", code }));
      ws.close(1000, "Shell exited");
    }
  });

  proc.on("error", (err) => {
    alive = false;
    if (ws.readyState === 1) ws.close(4002, `Shell error: ${err.message}`);
  });

  ws.on("message", (msg) => {
    try {
      const parsed = JSON.parse(msg.toString());
      if (parsed.type === "stdin" && parsed.data && proc.stdin.writable) {
        proc.stdin.write(parsed.data);
      }
      if (parsed.type === "resize" && parsed.cols && parsed.rows) {
        // Resize is tricky with docker exec -i (non-tty). Skip for now.
      }
    } catch {
      // Raw string input
      if (proc.stdin.writable) proc.stdin.write(msg.toString());
    }
  });

  ws.on("close", () => {
    alive = false;
    try { proc.kill(); } catch {}
  });

  ws.send(JSON.stringify({ type: "connected", computerId, containerId }));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Vessel WebSocket terminal on port ${PORT}`);
});

const http = require("http");
const crypto = require("crypto");

const PORT = 8422;
const ORCH_URL = "http://127.0.0.1:8421";
const ORCH_TOKEN = process.env.VESSEL_ORCHESTRATOR_TOKEN || "vsl-orch-mvp-2026";

// Supabase config for auth verification
const SUPABASE_URL = process.env.VESSEL_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.VESSEL_SUPABASE_SERVICE_KEY || "";

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function sendJson(res, status, data) {
  // CORS headers
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data));
}

function sendBinary(res, status, contentType, data) {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Content-Length": data.length,
    "Access-Control-Allow-Origin": "*",
  });
  res.end(data);
}

const INTERNAL_TOKEN = process.env.VESSEL_INTERNAL_TOKEN || "vsl-internal-mvp-2026";

// Verify auth: either vsl_ API key or internal server token
async function verifyAuth(req) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace("Bearer ", "");

  // Internal server-to-server token (from Vercel)
  if (token === INTERNAL_TOKEN) {
    // user_id must be in X-Vessel-User-Id header
    const userId = req.headers["x-vessel-user-id"];
    return userId || null;
  }

  // External vsl_ API key
  return verifyApiKey(token);
}

// Verify API key against Supabase
async function verifyApiKey(apiKey) {
  if (!apiKey || !apiKey.startsWith("vsl_")) return null;

  // Hash the key
  const hash = crypto.createHash("sha256").update(apiKey).digest("hex");

  // Look up in Supabase
  const url = `${SUPABASE_URL}/rest/v1/api_keys?key_hash=eq.${hash}&revoked_at=is.null&select=user_id`;
  try {
    const resp = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    const data = await resp.json();
    if (Array.isArray(data) && data.length > 0) {
      // Update last_used_at (fire and forget)
      fetch(`${SUPABASE_URL}/rest/v1/api_keys?key_hash=eq.${hash}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ last_used_at: new Date().toISOString() }),
      }).catch(() => {});
      return data[0].user_id;
    }
  } catch {}
  return null;
}

// Proxy to orchestrator
function orchRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: "127.0.0.1",
      port: 8421,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ORCH_TOKEN}`,
      },
      timeout: 40000,
    };

    const req = http.request(opts, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks),
        });
      });
    });

    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Orchestrator timeout")); });

    if (body && method !== "GET") req.write(JSON.stringify(body));
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health (no auth)
  if (req.method === "GET" && url.pathname === "/v1/health") {
    try {
      const orchRes = await orchRequest("GET", "/health");
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      return res.end(orchRes.body);
    } catch {
      return sendJson(res, 503, { error: "Orchestrator unavailable" });
    }
  }

  // Auth check for all other endpoints
  const userId = await verifyAuth(req);
  if (!userId) {
    return sendJson(res, 401, { error: "Invalid or missing API key" });
  }

  // POST /v1/computers
  if (req.method === "POST" && url.pathname === "/v1/computers") {
    const body = await parseBody(req);
    try {
      const orchRes = await orchRequest("POST", "/containers", {
        name: body.name || "computer",
        cpu: body.cpu,
        ram: body.ram,
        resolution: body.resolution,
      });
      const orchData = JSON.parse(orchRes.body.toString());

      if (orchRes.status !== 201) {
        return sendJson(res, orchRes.status, orchData);
      }

      // Also create/update the Supabase record
      const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/computers`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          user_id: userId,
          workspace_id: await getOrCreateWorkspace(userId),
          name: body.name || "computer",
          os: "linux",
          cpu: body.cpu || 1,
          ram: body.ram || 4,
          disk_size_gb: body.disk_size_gb || 8,
          resolution: body.resolution || "1280x720x24",
          status: "running",
          container_id: orchData.id,
          hostname: `127.0.0.1:${orchData.port}`,
        }),
      });
      const computer = await supaRes.json();

      return sendJson(res, 201, Array.isArray(computer) ? computer[0] : computer);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // GET /v1/computers
  if (req.method === "GET" && url.pathname === "/v1/computers") {
    const supaRes = await fetch(
      `${SUPABASE_URL}/rest/v1/computers?user_id=eq.${userId}&status=neq.terminated&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );
    const computers = await supaRes.json();
    return sendJson(res, 200, { computers, total: computers.length });
  }

  // Proxy: GET /v1/computers/:id/screenshot
  const screenshotMatch = url.pathname.match(/^\/v1\/computers\/([^/]+)\/screenshot$/);
  if (req.method === "GET" && screenshotMatch) {
    const computerId = screenshotMatch[1];
    const containerId = await getContainerId(computerId, userId);
    if (!containerId) return sendJson(res, 404, { error: "Computer not found" });

    try {
      const orchRes = await orchRequest("GET", `/containers/${containerId}/screenshot`);
      if (orchRes.status === 200) {
        return sendBinary(res, 200, orchRes.headers["content-type"] || "image/png", orchRes.body);
      }
      res.writeHead(orchRes.status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      return res.end(orchRes.body);
    } catch (err) {
      return sendJson(res, 502, { error: err.message });
    }
  }

  // Proxy: POST /v1/computers/:id/actions
  const actionsMatch = url.pathname.match(/^\/v1\/computers\/([^/]+)\/actions$/);
  if (req.method === "POST" && actionsMatch) {
    const computerId = actionsMatch[1];
    const containerId = await getContainerId(computerId, userId);
    if (!containerId) return sendJson(res, 404, { error: "Computer not found" });

    const body = await parseBody(req);
    try {
      const orchRes = await orchRequest("POST", `/containers/${containerId}/actions`, body);
      res.writeHead(orchRes.status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      return res.end(orchRes.body);
    } catch (err) {
      return sendJson(res, 502, { error: err.message });
    }
  }

  // Proxy: POST /v1/computers/:id/bash
  const bashMatch = url.pathname.match(/^\/v1\/computers\/([^/]+)\/bash$/);
  if (req.method === "POST" && bashMatch) {
    const computerId = bashMatch[1];
    const containerId = await getContainerId(computerId, userId);
    if (!containerId) return sendJson(res, 404, { error: "Computer not found" });

    const body = await parseBody(req);
    try {
      const orchRes = await orchRequest("POST", `/containers/${containerId}/bash`, body);
      res.writeHead(orchRes.status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      return res.end(orchRes.body);
    } catch (err) {
      return sendJson(res, 502, { error: err.message });
    }
  }

  // POST /v1/computers/:id/restart
  const restartMatch = url.pathname.match(/^\/v1\/computers\/([^/]+)\/restart$/);
  if (req.method === "POST" && restartMatch) {
    const computerId = restartMatch[1];
    const containerId = await getContainerId(computerId, userId);
    if (!containerId) return sendJson(res, 404, { error: "Computer not found" });

    try {
      const orchRes = await orchRequest("POST", `/containers/${containerId}/restart`);
      const orchData = JSON.parse(orchRes.body.toString());
      return sendJson(res, orchRes.status, orchData);
    } catch (err) {
      return sendJson(res, 502, { error: err.message });
    }
  }

  // DELETE /v1/computers/:id
  const deleteMatch = url.pathname.match(/^\/v1\/computers\/([^/]+)$/);
  if (req.method === "DELETE" && deleteMatch) {
    const computerId = deleteMatch[1];
    const containerId = await getContainerId(computerId, userId);
    if (!containerId) return sendJson(res, 404, { error: "Computer not found" });

    try {
      await orchRequest("DELETE", `/containers/${containerId}`);
      // Mark terminated in Supabase
      await fetch(`${SUPABASE_URL}/rest/v1/computers?id=eq.${computerId}&user_id=eq.${userId}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "terminated", terminated_at: new Date().toISOString() }),
      });
      return sendJson(res, 200, { ok: true });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  sendJson(res, 404, { error: "Not found" });
});

// Helpers
async function getOrCreateWorkspace(userId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/workspaces?user_id=eq.${userId}&limit=1`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  const data = await res.json();
  if (data.length > 0) return data[0].id;

  const createRes = await fetch(`${SUPABASE_URL}/rest/v1/workspaces`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ user_id: userId, name: "Default" }),
  });
  const ws = await createRes.json();
  return Array.isArray(ws) ? ws[0].id : ws.id;
}

async function getContainerId(computerId, userId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/computers?id=eq.${computerId}&user_id=eq.${userId}&select=container_id`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  const data = await res.json();
  if (data.length > 0 && data[0].container_id) return data[0].container_id;
  return null;
}

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Vessel API server on port ${PORT}`);
});

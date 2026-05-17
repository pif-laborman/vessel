const http = require("http");
const { execSync } = require("child_process");
const crypto = require("crypto");

const PORT = 8421;
const IMAGE = "vessel-desktop:latest";
const NETWORK = "vessel-ext";
const PORT_RANGE_START = 10000;
const PORT_RANGE_END = 10100;
const MAX_CONTAINERS = 2;
const DEFAULT_CPU = 1;
const DEFAULT_RAM = "2g";
const LABEL = "vessel-computer";
const AUTH_TOKEN = process.env.VESSEL_ORCHESTRATOR_TOKEN || "vsl-orch-secret";

// Track containers: { containerId: { port, name, cpu, ram, createdAt } }
const containers = new Map();

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
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function checkAuth(req) {
  const auth = req.headers["authorization"] || "";
  return auth === `Bearer ${AUTH_TOKEN}`;
}

function findFreePort() {
  const usedPorts = new Set([...containers.values()].map((c) => c.port));
  for (let p = PORT_RANGE_START; p <= PORT_RANGE_END; p++) {
    if (!usedPorts.has(p)) {
      try {
        execSync(`ss -tlnp | grep :${p}`, { encoding: "utf-8" });
      } catch {
        return p;
      }
    }
  }
  return null;
}

function syncContainers() {
  try {
    const output = execSync(
      `docker ps --filter "label=${LABEL}" --format "{{.ID}}|{{.Names}}|{{.Ports}}" 2>/dev/null`,
      { encoding: "utf-8" }
    ).trim();
    if (!output) return;
    for (const line of output.split("\n")) {
      const [id, name, ports] = line.split("|");
      if (id && !containers.has(id.slice(0, 12))) {
        const portMatch = ports?.match(/:(\d+)->/);
        const port = portMatch ? parseInt(portMatch[1]) : 0;
        containers.set(id.slice(0, 12), { port, name, cpu: DEFAULT_CPU, ram: DEFAULT_RAM, createdAt: new Date().toISOString() });
      }
    }
  } catch {}
}

function createContainer(name, cpu, ram, resolution) {
  if (containers.size >= MAX_CONTAINERS) {
    throw new Error(`Max ${MAX_CONTAINERS} containers reached`);
  }

  const port = findFreePort();
  if (!port) throw new Error("No free ports available");

  const cpuLimit = Math.min(cpu || DEFAULT_CPU, 2);
  const ramLimit = ram ? `${Math.min(ram, 4)}g` : DEFAULT_RAM;
  const res = resolution || "1280x720x24";
  const containerName = `vessel-${name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}-${crypto.randomBytes(3).toString("hex")}`;

  const cmd = [
    "docker run -d",
    `--name ${containerName}`,
    `--label ${LABEL}`,
    `--cpus=${cpuLimit}`,
    `--memory=${ramLimit}`,
    `--memory-swap=${ramLimit}`,
    `--pids-limit=256`,
    `--network ${NETWORK}`,
    `-p ${port}:8420`,
    `-e VESSEL_RESOLUTION=${res}`,
    IMAGE,
  ].join(" ");

  const containerId = execSync(cmd, { encoding: "utf-8" }).trim().slice(0, 12);

  containers.set(containerId, {
    port,
    name: containerName,
    cpu: cpuLimit,
    ram: ramLimit,
    createdAt: new Date().toISOString(),
  });

  return { id: containerId, port, name: containerName };
}

function stopContainer(containerId) {
  execSync(`docker stop ${containerId}`, { timeout: 15000 });
  execSync(`docker rm ${containerId}`, { timeout: 10000 });
  containers.delete(containerId);
}

function restartContainer(containerId) {
  execSync(`docker restart ${containerId}`, { timeout: 30000 });
}

function stopContainerOnly(containerId) {
  execSync(`docker stop ${containerId}`, { timeout: 15000 });
}

function startContainer(containerId) {
  execSync(`docker start ${containerId}`, { timeout: 15000 });
}

function resizeContainer(containerId, cpu, ram) {
  const args = [];
  if (cpu) args.push(`--cpus=${Math.min(cpu, 2)}`);
  if (ram) args.push(`--memory=${Math.min(ram, 4)}g`, `--memory-swap=${Math.min(ram, 4)}g`);
  if (args.length > 0) {
    execSync(`docker update ${args.join(" ")} ${containerId}`, { timeout: 10000 });
  }
}

function proxyToAgent(port, method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: "127.0.0.1",
      port,
      path,
      method,
      headers: { "Content-Type": "application/json" },
      timeout: 35000,
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

    req.on("error", (err) => reject(err));
    req.on("timeout", () => { req.destroy(); reject(new Error("Agent timeout")); });

    if (body && method !== "GET") {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Sync on startup
syncContainers();

const server = http.createServer(async (req, res) => {
  if (!checkAuth(req)) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health
  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, { status: "ok", containers: containers.size, max: MAX_CONTAINERS });
  }

  // List containers
  if (req.method === "GET" && url.pathname === "/containers") {
    const list = [];
    for (const [id, info] of containers) {
      list.push({ id, ...info });
    }
    return sendJson(res, 200, { containers: list });
  }

  // Create container
  if (req.method === "POST" && url.pathname === "/containers") {
    const body = await parseBody(req);
    try {
      const result = createContainer(body.name || "computer", body.cpu, body.ram, body.resolution);
      return sendJson(res, 201, result);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // Delete container
  const deleteMatch = url.pathname.match(/^\/containers\/([a-f0-9]+)$/);
  if (req.method === "DELETE" && deleteMatch) {
    const id = deleteMatch[1];
    if (!containers.has(id)) {
      return sendJson(res, 404, { error: "Container not found" });
    }
    try {
      stopContainer(id);
      return sendJson(res, 200, { ok: true });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Restart container
  const restartMatch = url.pathname.match(/^\/containers\/([a-f0-9]+)\/restart$/);
  if (req.method === "POST" && restartMatch) {
    const id = restartMatch[1];
    if (!containers.has(id)) return sendJson(res, 404, { error: "Container not found" });
    try { restartContainer(id); return sendJson(res, 200, { ok: true }); }
    catch (err) { return sendJson(res, 500, { error: err.message }); }
  }

  // Stop container (without removing)
  const stopOnlyMatch = url.pathname.match(/^\/containers\/([a-f0-9]+)\/stop$/);
  if (req.method === "POST" && stopOnlyMatch) {
    const id = stopOnlyMatch[1];
    if (!containers.has(id)) return sendJson(res, 404, { error: "Container not found" });
    try { stopContainerOnly(id); return sendJson(res, 200, { ok: true }); }
    catch (err) { return sendJson(res, 500, { error: err.message }); }
  }

  // Start a stopped container
  const startMatch = url.pathname.match(/^\/containers\/([a-f0-9]+)\/start$/);
  if (req.method === "POST" && startMatch) {
    const id = startMatch[1];
    if (!containers.has(id)) return sendJson(res, 404, { error: "Container not found" });
    try { startContainer(id); return sendJson(res, 200, { ok: true }); }
    catch (err) { return sendJson(res, 500, { error: err.message }); }
  }

  // Resize container
  const resizeMatch = url.pathname.match(/^\/containers\/([a-f0-9]+)\/resize$/);
  if (req.method === "POST" && resizeMatch) {
    const id = resizeMatch[1];
    if (!containers.has(id)) return sendJson(res, 404, { error: "Container not found" });
    const body = await parseBody(req);
    try {
      resizeContainer(id, body.cpu, body.ram);
      const info = containers.get(id);
      if (body.cpu) info.cpu = body.cpu;
      if (body.ram) info.ram = `${body.ram}g`;
      return sendJson(res, 200, { ok: true });
    } catch (err) { return sendJson(res, 500, { error: err.message }); }
  }

  // Proxy to agent: all action and file endpoints
  const proxyMatch = url.pathname.match(/^\/containers\/([a-f0-9]+)\/(screenshot|actions|click|drag|type|key|scroll|wait|bash|python|health|files|files\/download|files\/upload)$/);
  if (proxyMatch) {
    const [, id, endpoint] = proxyMatch;
    const info = containers.get(id);
    if (!info) {
      return sendJson(res, 404, { error: "Container not found" });
    }

    try {
      const body = req.method === "POST" ? await parseBody(req) : null;
      const qs = url.search || "";
      const agentRes = await proxyToAgent(
        info.port,
        req.method,
        `/${endpoint}${qs}`,
        body
      );

      // Pass through binary responses (screenshots, file downloads)
      const ct = agentRes.headers["content-type"] || "";
      if (agentRes.status === 200 && ct && !ct.includes("json")) {
        res.writeHead(200, {
          "Content-Type": ct,
          "Content-Length": agentRes.body.length,
          ...(agentRes.headers["content-disposition"] ? { "Content-Disposition": agentRes.headers["content-disposition"] } : {}),
        });
        return res.end(agentRes.body);
      }

      res.writeHead(agentRes.status, { "Content-Type": "application/json" });
      return res.end(agentRes.body);
    } catch (err) {
      return sendJson(res, 502, { error: `Agent unreachable: ${err.message}` });
    }
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Vessel orchestrator on port ${PORT} (max ${MAX_CONTAINERS} containers)`);
});

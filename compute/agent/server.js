const http = require("http");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PORT = 8420;
const SCREENSHOT_PATH = "/tmp/screenshot.png";
const MAX_OUTPUT = 64 * 1024;
const EXEC_TIMEOUT = 30_000;

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

function takeScreenshot() {
  execSync(`xdotool getactivewindow 2>/dev/null || true`, { timeout: 2000 });
  execSync(`import -window root -display :99 ${SCREENSHOT_PATH}`, { timeout: 5000 });
  return fs.readFileSync(SCREENSHOT_PATH);
}

function doClick(x, y, button = "left", repeat = 1) {
  const btn = button === "right" ? "3" : button === "middle" ? "2" : "1";
  execSync(`DISPLAY=:99 xdotool mousemove ${x} ${y} click --repeat ${repeat} ${btn}`, { timeout: 3000 });
}

function doDrag(startX, startY, endX, endY, button = "left") {
  const btn = button === "right" ? "3" : "1";
  execSync(`DISPLAY=:99 xdotool mousemove ${startX} ${startY} mousedown ${btn} mousemove ${endX} ${endY} mouseup ${btn}`, { timeout: 5000 });
}

function doType(text) {
  execSync(`DISPLAY=:99 xdotool type --clearmodifiers -- "${text.replace(/"/g, '\\"')}"`, { timeout: 10000 });
}

function doKey(key) {
  execSync(`DISPLAY=:99 xdotool key -- ${key}`, { timeout: 3000 });
}

function doScroll(x, y, direction, amount = 3) {
  const btn = direction === "up" ? "4" : "5";
  execSync(`DISPLAY=:99 xdotool mousemove ${x} ${y} click --repeat ${amount} ${btn}`, { timeout: 3000 });
}

function runBash(command, cwd = "/root") {
  try {
    const stdout = execSync(command, {
      cwd, timeout: EXEC_TIMEOUT, maxBuffer: MAX_OUTPUT, encoding: "utf-8",
      env: { ...process.env, DISPLAY: ":99", TERM: "xterm-256color" },
    });
    return { stdout: stdout || "", stderr: "", exit_code: 0 };
  } catch (err) {
    return { stdout: err.stdout || "", stderr: err.stderr || err.message || "Command failed", exit_code: err.status || 1 };
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health
  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, { status: "ok", uptime: process.uptime() });
  }

  // Screenshot (supports ?format=base64 for JSON response)
  if (req.method === "GET" && url.pathname === "/screenshot") {
    try {
      const img = takeScreenshot();
      const format = url.searchParams.get("format");
      if (format === "base64") {
        return sendJson(res, 200, {
          success: true,
          image: `data:image/png;base64,${img.toString("base64")}`,
          metadata: { width: 1280, height: 720, format: "png", size: img.length, timestamp: new Date().toISOString() },
        });
      }
      res.writeHead(200, { "Content-Type": "image/png", "Content-Length": img.length });
      return res.end(img);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST /click
  if (req.method === "POST" && url.pathname === "/click") {
    const body = await parseBody(req);
    try {
      const repeat = body.double_click ? 2 : 1;
      doClick(body.x, body.y, body.button || "left", repeat);
      return sendJson(res, 200, { ok: true });
    } catch (err) { return sendJson(res, 500, { error: err.message }); }
  }

  // POST /drag
  if (req.method === "POST" && url.pathname === "/drag") {
    const body = await parseBody(req);
    try {
      doDrag(body.start_x, body.start_y, body.end_x, body.end_y, body.button || "left");
      return sendJson(res, 200, { ok: true });
    } catch (err) { return sendJson(res, 500, { error: err.message }); }
  }

  // POST /type
  if (req.method === "POST" && url.pathname === "/type") {
    const body = await parseBody(req);
    if (!body.text) return sendJson(res, 400, { error: "Missing 'text'" });
    try {
      doType(body.text);
      return sendJson(res, 200, { ok: true });
    } catch (err) { return sendJson(res, 500, { error: err.message }); }
  }

  // POST /key
  if (req.method === "POST" && url.pathname === "/key") {
    const body = await parseBody(req);
    if (!body.key) return sendJson(res, 400, { error: "Missing 'key'" });
    try {
      doKey(body.key);
      return sendJson(res, 200, { ok: true });
    } catch (err) { return sendJson(res, 500, { error: err.message }); }
  }

  // POST /scroll
  if (req.method === "POST" && url.pathname === "/scroll") {
    const body = await parseBody(req);
    try {
      doScroll(body.x || 0, body.y || 0, body.direction || "down", body.amount || 3);
      return sendJson(res, 200, { ok: true });
    } catch (err) { return sendJson(res, 500, { error: err.message }); }
  }

  // POST /wait
  if (req.method === "POST" && url.pathname === "/wait") {
    const body = await parseBody(req);
    const ms = Math.min((body.seconds || 1) * 1000, 30000);
    await new Promise((r) => setTimeout(r, ms));
    return sendJson(res, 200, { ok: true, waited_ms: ms });
  }

  // POST /actions (legacy, still supported)
  if (req.method === "POST" && url.pathname === "/actions") {
    const body = await parseBody(req);
    try {
      switch (body.type) {
        case "click": doClick(body.x, body.y, body.button, body.double_click ? 2 : 1); break;
        case "double_click": doClick(body.x, body.y, "left", 2); break;
        case "type": doType(body.text); break;
        case "key": doKey(body.key); break;
        case "scroll": doScroll(body.x || 0, body.y || 0, body.direction || "down", body.amount || 3); break;
        case "drag": doDrag(body.start_x, body.start_y, body.end_x, body.end_y, body.button); break;
        default: return sendJson(res, 400, { error: `Unknown action: ${body.type}` });
      }
      return sendJson(res, 200, { ok: true });
    } catch (err) { return sendJson(res, 500, { error: err.message }); }
  }

  // POST /bash
  if (req.method === "POST" && url.pathname === "/bash") {
    const body = await parseBody(req);
    if (!body.command) return sendJson(res, 400, { error: "Missing 'command'" });
    return sendJson(res, 200, runBash(body.command, body.cwd));
  }

  // POST /python
  if (req.method === "POST" && url.pathname === "/python") {
    const body = await parseBody(req);
    if (!body.code) return sendJson(res, 400, { error: "Missing 'code'" });
    const tmpFile = `/tmp/vessel_py_${Date.now()}.py`;
    fs.writeFileSync(tmpFile, body.code);
    const result = runBash(`python3 ${tmpFile}`, body.cwd);
    try { fs.unlinkSync(tmpFile); } catch {}
    return sendJson(res, 200, result);
  }

  // GET /files?path= (list files)
  if (req.method === "GET" && url.pathname === "/files") {
    const dirPath = url.searchParams.get("path") || "/root";
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true }).map((e) => ({
        name: e.name,
        type: e.isDirectory() ? "directory" : "file",
        size: e.isDirectory() ? 0 : fs.statSync(path.join(dirPath, e.name)).size,
      }));
      return sendJson(res, 200, { path: dirPath, entries });
    } catch (err) { return sendJson(res, 500, { error: err.message }); }
  }

  // GET /files/download?path= (download a file)
  if (req.method === "GET" && url.pathname === "/files/download") {
    const filePath = url.searchParams.get("path");
    if (!filePath) return sendJson(res, 400, { error: "Missing 'path'" });
    try {
      const stat = fs.statSync(filePath);
      if (stat.size > 50 * 1024 * 1024) return sendJson(res, 400, { error: "File too large (max 50MB)" });
      const data = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": data.length,
      });
      return res.end(data);
    } catch (err) { return sendJson(res, 500, { error: err.message }); }
  }

  // POST /files/upload (upload a file, body is raw + query params)
  if (req.method === "POST" && url.pathname === "/files/upload") {
    const destPath = url.searchParams.get("path");
    if (!destPath) return sendJson(res, 400, { error: "Missing 'path' query param" });
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const dir = path.dirname(destPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(destPath, Buffer.concat(chunks));
        return sendJson(res, 200, { ok: true, path: destPath, size: Buffer.concat(chunks).length });
      } catch (err) { return sendJson(res, 500, { error: err.message }); }
    });
    return;
  }

  // DELETE /files?path= (delete a file)
  if (req.method === "DELETE" && url.pathname === "/files") {
    const filePath = url.searchParams.get("path");
    if (!filePath) return sendJson(res, 400, { error: "Missing 'path'" });
    try {
      fs.unlinkSync(filePath);
      return sendJson(res, 200, { ok: true });
    } catch (err) { return sendJson(res, 500, { error: err.message }); }
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vessel agent listening on port ${PORT}`);
});

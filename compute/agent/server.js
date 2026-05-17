const http = require("http");
const { execSync, exec } = require("child_process");
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

function screenshot() {
  try {
    execSync(`xdotool getactivewindow 2>/dev/null || true`, { timeout: 2000 });
    execSync(
      `import -window root -display :99 ${SCREENSHOT_PATH}`,
      { timeout: 5000 }
    );
    return fs.readFileSync(SCREENSHOT_PATH);
  } catch (err) {
    throw new Error("Screenshot failed: " + err.message);
  }
}

function click(x, y, button = "1") {
  const btn = button === "right" ? "3" : button === "middle" ? "2" : "1";
  execSync(`DISPLAY=:99 xdotool mousemove ${x} ${y} click ${btn}`, { timeout: 3000 });
}

function doubleClick(x, y) {
  execSync(`DISPLAY=:99 xdotool mousemove ${x} ${y} click --repeat 2 1`, { timeout: 3000 });
}

function typeText(text) {
  execSync(`DISPLAY=:99 xdotool type --clearmodifiers -- "${text.replace(/"/g, '\\"')}"`, { timeout: 10000 });
}

function keyPress(key) {
  execSync(`DISPLAY=:99 xdotool key -- ${key}`, { timeout: 3000 });
}

function scroll(x, y, direction, amount = 3) {
  const btn = direction === "up" ? "4" : "5";
  execSync(`DISPLAY=:99 xdotool mousemove ${x} ${y} click --repeat ${amount} ${btn}`, { timeout: 3000 });
}

function runBash(command, cwd = "/root") {
  try {
    const stdout = execSync(command, {
      cwd,
      timeout: EXEC_TIMEOUT,
      maxBuffer: MAX_OUTPUT,
      encoding: "utf-8",
      env: { ...process.env, DISPLAY: ":99", TERM: "xterm-256color" },
    });
    return { stdout: stdout || "", stderr: "", exit_code: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || "",
      stderr: err.stderr || err.message || "Command failed",
      exit_code: err.status || 1,
    };
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health check
  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, { status: "ok", uptime: process.uptime() });
  }

  // Screenshot
  if (req.method === "GET" && url.pathname === "/screenshot") {
    try {
      const img = screenshot();
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": img.length,
      });
      return res.end(img);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Actions (click, type, key, scroll)
  if (req.method === "POST" && url.pathname === "/actions") {
    const body = await parseBody(req);
    try {
      switch (body.type) {
        case "click":
          click(body.x, body.y, body.button);
          break;
        case "double_click":
          doubleClick(body.x, body.y);
          break;
        case "type":
          typeText(body.text);
          break;
        case "key":
          keyPress(body.key);
          break;
        case "scroll":
          scroll(body.x || 0, body.y || 0, body.direction || "down", body.amount || 3);
          break;
        default:
          return sendJson(res, 400, { error: `Unknown action type: ${body.type}` });
      }
      return sendJson(res, 200, { ok: true });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Bash execution
  if (req.method === "POST" && url.pathname === "/bash") {
    const body = await parseBody(req);
    if (!body.command) {
      return sendJson(res, 400, { error: "Missing 'command'" });
    }
    const result = runBash(body.command, body.cwd);
    return sendJson(res, 200, result);
  }

  // Python execution
  if (req.method === "POST" && url.pathname === "/python") {
    const body = await parseBody(req);
    if (!body.code) {
      return sendJson(res, 400, { error: "Missing 'code'" });
    }
    const tmpFile = `/tmp/vessel_py_${Date.now()}.py`;
    fs.writeFileSync(tmpFile, body.code);
    const result = runBash(`python3 ${tmpFile}`, body.cwd);
    try { fs.unlinkSync(tmpFile); } catch {}
    return sendJson(res, 200, result);
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vessel agent listening on port ${PORT}`);
});

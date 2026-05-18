@AGENTS.md

# Corix - Cloud Desktops for AI Agents

## What this is
Orgo competitor. API-first cloud desktop infrastructure that lets developers spin up virtual machines, connect AI agents, and let them control computers programmatically (screenshot, click, type, bash, python, files).

## Architecture

### Frontend (Vercel)
- Next.js 16, Tailwind 4, Rekon design system (light theme, DM Sans + Inter + Fragment Mono)
- Dashboard at /dashboard with sidebar thumbnails, inline noVNC desktop viewer, unified settings modal
- Computer URLs: /dashboard/computers/{id} (client-side pushState, no server round-trip)
- Auth: Supabase (Google OAuth + email magic link)
- DESIGN.md has the full token reference

### Backend (VPS at meetpif.com)
- **corix-orchestrator** (port 8421, systemd) - manages Docker containers, proxies to agents
- **corix-api** (port 8422, systemd) - public API with auth, rate limiting, Supabase integration
- **corix-ws-terminal** (port 8423, systemd) - WebSocket terminal for interactive shell
- **nginx proxy**: /corix-api/ -> 8422, /corix-ws/ -> 8423, /corix-vnc/{port}/ -> noVNC
- **env file**: /etc/corix-api.env
- **cleanup cron**: every 5 min, kills containers older than 30 min

### Container image (corix-desktop:latest)
- Debian bookworm + XFCE + Xvfb + Google Chrome + Python + Node.js + git
- WhiteSur Dark GTK theme (macOS-style traffic light buttons, dark windows)
- WhiteSur Dark icon theme + WhiteSur cursors
- Plank dock at bottom (Chrome, Terminal, File Manager)
- macOS Sonoma-style wallpaper (purple/blue gradient)
- Chrome wrapper: auto-adds --no-sandbox --disable-gpu flags
- x11vnc + noVNC (websockify) for real-time desktop streaming on port 6080
- In-container agent on port 8420 (separate endpoints: /click, /drag, /type, /key, /scroll, /wait, /bash, /python, /screenshot, /files)
- Entrypoint cleans stale X11 locks, generates machine-id, starts Xvfb -> dbus -> XFCE -> Plank -> x11vnc -> websockify -> agent
- XFCE compositor disabled for performance
- Resource limits: max 2 CPU / 4 GB RAM per container, max 2 concurrent, PID limit 512

### Database (Supabase project: corix, ref: zyycljctvwquirciolfl)
- **profiles**: auto-created on signup via trigger, tracks plan + limits + api_calls_today
- **workspaces**: groups computers, has icon_url (uploaded to Supabase Storage)
- **api_keys**: vsl_ prefix, SHA-256 hashed, key_prefix for display
- **computers**: 17 columns including container_id, hostname, auto_stop_minutes
- **computer_actions**: audit log (table exists, not yet recording)
- All tables have RLS scoped by user_id
- Storage bucket: workspace-icons (public)

### Credentials
- Supabase Management API: Nango connector (supabase-management, connection 02d7a168)
- GCP service account: /root/.gcp/corix-sa.json (corix-infra@corix-496613, Owner role)
- Google OAuth client: 607757625794-da5q70gteo8k9u1sf4p4uurmj6djn1pu.apps.googleusercontent.com
- Vercel: pif-creds get Vercel, project "corix" on piflaborman-1824s-projects
- Orchestrator token: vsl-orch-mvp-2026
- Internal token (Vercel to VPS): vsl-internal-mvp-2026

## API surface (30+ endpoints)
- Workspaces: create, get, list, delete
- Computers: create, get, list, delete, clone, resize, move
- Lifecycle: start, stop, restart, auto-stop (get/set)
- Actions: screenshot (?format=base64|jpeg), click, drag, type, key, scroll, wait
- Execution: bash, python
- Files: list, upload, download, delete
- Streaming: WebSocket terminal, noVNC real-time desktop
- Auth: vsl_ API keys (SHA-256 lookup), internal server token bypass
- Rate limiting: 50,000 calls/day starter, unlimited pro/scale. Internal calls bypass.

## Desktop viewer
- Uses noVNC (embedded iframe) for real-time VNC streaming
- x11vnc captures Xvfb :99, websockify proxies ws://6080 -> vnc://5900
- nginx at /corix-vnc/{port}/ handles WebSocket upgrade
- The DesktopViewer component embeds vnc_lite.html with autoconnect + resize=scale
- Sidebar thumbnails still use screenshot polling (JPEG, 5s intervals) via Vercel proxy

## Navigation
- All view switching is client-side via window.history.pushState (instant, no server round-trip)
- Browser back/forward handled via popstate listener
- First page load fetches fresh data from server (Supabase queries in page.tsx)

## Still deferred
- Events WebSocket (12 event types: window, clipboard, file, process, idle, audio)
- Audio WebSocket streaming (PCM)
- RTMP live video streaming
- Published SDK packages (PyPI corix-sdk, npm @corix/sdk)
- Custom domain (corixcompute.com available)
- GitHub OAuth (needs GitHub OAuth app setup in Supabase)
- Stripe billing integration
- Container image templates (pre-configured environments)
- computer_actions audit table: exists but actions not yet recorded to it
- Auto-stop enforcement: field exists, endpoints exist, but no background job actually stops idle containers

## Key files
- compute/orchestrator.js - Docker container lifecycle + noVNC port mapping
- compute/api-server.js - public API with auth, rate limiting, all 30+ endpoints
- compute/ws-terminal.js - WebSocket terminal
- compute/agent/server.js - in-container agent (separate action endpoints + files + screenshot formats)
- compute/docker/Dockerfile - container image (Chrome, WhiteSur theme, noVNC)
- compute/docker/entrypoint.sh - startup: Xvfb -> dbus -> XFCE -> Plank -> x11vnc -> websockify -> agent
- compute/docker/xfce-config/ - XFCE appearance configs (WhiteSur Dark theme, panel, desktop)
- compute/docker/themes/ - pre-built WhiteSur GTK + icons + cursors (not all in git due to size)
- compute/corix-cleanup.sh - zombie container killer (cron)
- src/app/dashboard/DashboardShell.tsx - main dashboard (sidebar, views, state)
- src/app/dashboard/DesktopViewer.tsx - noVNC iframe embed
- src/app/dashboard/UnifiedSettings.tsx - settings modal (workspace, profile, computers)
- src/app/dashboard/HomeGrid.tsx - computer grid with live thumbnails
- src/app/dashboard/WorkspaceMenu.tsx - sidebar dropdown (workspaces, account)
- src/app/dashboard/ComputerMenu.tsx - computer "..." dropdown (settings, restart, clone, delete)
- src/app/docs/page.tsx - API documentation (all 30+ endpoints)

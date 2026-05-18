#!/bin/bash

RESOLUTION="${CORIX_RESOLUTION:-1280x720x24}"

# Clean up stale X lock files from previous runs (e.g. docker restart)
rm -f /tmp/.X99-lock
rm -rf /tmp/.X11-unix

# Start Xvfb (virtual display)
Xvfb :99 -screen 0 "${RESOLUTION}" -ac +extension GLX +render -noreset &

# Wait for display to be ready
for i in $(seq 1 30); do
    if xdpyinfo -display :99 >/dev/null 2>&1; then
        break
    fi
    sleep 0.5
done

# Start dbus (session bus for Chrome and desktop apps)
eval $(dbus-launch --sh-syntax)
export DBUS_SESSION_BUS_ADDRESS

# Generate machine-id for Chrome
if [ ! -f /etc/machine-id ] || [ ! -s /etc/machine-id ]; then
    cat /proc/sys/kernel/random/uuid | tr -d '-' > /etc/machine-id
fi

# Start XFCE desktop
DISPLAY=:99 startxfce4 &

# Wait for window manager
for i in $(seq 1 20); do
    if DISPLAY=:99 xdotool getactivewindow >/dev/null 2>&1; then
        break
    fi
    sleep 0.5
done

# Start Plank dock (macOS-style bottom dock)
DISPLAY=:99 plank &

# Start x11vnc (VNC server on display :99, no password for internal use)
x11vnc -display :99 -forever -shared -nopw -rfbport 5900 -bg -o /tmp/x11vnc.log

# Start noVNC (WebSocket proxy: ws://localhost:6080 -> vnc://localhost:5900)
websockify --web /usr/share/novnc 6080 localhost:5900 &

# Start the Vessel agent
exec node /opt/corix-agent/server.js

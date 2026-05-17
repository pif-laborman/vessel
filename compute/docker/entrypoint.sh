#!/bin/bash

RESOLUTION="${VESSEL_RESOLUTION:-1280x720x24}"

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

# Start dbus
eval $(dbus-launch --sh-syntax)
export DBUS_SESSION_BUS_ADDRESS

# Start XFCE desktop
DISPLAY=:99 startxfce4 &

# Wait for window manager
for i in $(seq 1 20); do
    if DISPLAY=:99 xdotool getactivewindow >/dev/null 2>&1; then
        break
    fi
    sleep 0.5
done

# Start the Vessel agent
exec node /opt/vessel-agent/server.js

#!/bin/bash
set -e

RESOLUTION="${VESSEL_RESOLUTION:-1280x720x24}"

# Start Xvfb (virtual display)
Xvfb :99 -screen 0 "${RESOLUTION}" -ac +extension GLX +render -noreset &
sleep 1

# Start dbus
eval $(dbus-launch --sh-syntax)
export DBUS_SESSION_BUS_ADDRESS

# Start XFCE desktop
DISPLAY=:99 startxfce4 &
sleep 2

# Start the Vessel agent
exec node /opt/vessel-agent/server.js

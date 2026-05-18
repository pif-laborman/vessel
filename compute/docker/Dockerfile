FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV DISPLAY=:99
ENV LANG=C.UTF-8

# Install desktop environment, Xvfb, utilities, and Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    xvfb \
    xfce4 \
    xfce4-terminal \
    xfce4-whiskermenu-plugin \
    plank \
    xdotool \
    imagemagick \
    dbus-x11 \
    x11-utils \
    x11-xserver-utils \
    procps \
    curl \
    wget \
    git \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    fonts-liberation \
    fonts-dejavu-core \
    ca-certificates \
    sudo \
    net-tools \
    htop \
    nano \
    unzip \
    gtk2-engines-murrine \
    gnome-themes-extra \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome + noVNC + x11vnc
RUN curl -fsSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o /tmp/chrome.deb && \
    apt-get update && apt-get install -y /tmp/chrome.deb x11vnc novnc websockify && \
    rm /tmp/chrome.deb && apt-get clean && rm -rf /var/lib/apt/lists/*

# Chrome wrapper: always run with --no-sandbox (required in containers)
RUN mv /usr/bin/google-chrome-stable /usr/bin/google-chrome-stable-real && \
    printf '#!/bin/bash\nexec /usr/bin/google-chrome-stable-real --no-sandbox --disable-gpu --disable-software-rasterizer "$@"\n' > /usr/bin/google-chrome-stable && \
    chmod +x /usr/bin/google-chrome-stable && \
    ln -sf /usr/bin/google-chrome-stable /usr/bin/google-chrome

# Install pre-built WhiteSur GTK theme (macOS Dark)
COPY docker/themes/gtk/WhiteSur-Dark /usr/share/themes/WhiteSur-Dark

# Install pre-built WhiteSur icons (macOS-style)
COPY docker/themes/icons/WhiteSur-dark /usr/share/icons/WhiteSur-dark

# Install pre-built WhiteSur cursors
COPY docker/themes/cursors/WhiteSur-cursors /usr/share/icons/WhiteSur-cursors

# Create macOS Sonoma-style wallpaper (rich blue-purple gradient with warm accent)
RUN convert -size 1280x720 \
    xc:none \
    \( -size 1280x720 gradient:'#0f0523'-'#1a1040' -evaluate multiply 1 \) \
    \( -size 640x360 radial-gradient:'#3a1078'-'#0f0523' -geometry +640+360 -compose over \) -composite \
    \( -size 400x400 radial-gradient:'#6c2c91'-transparent -geometry +900+100 -compose over \) -composite \
    \( -size 500x300 radial-gradient:'#1e3a6e'-transparent -geometry +100+400 -compose over \) -composite \
    \( -size 300x300 radial-gradient:'#c7435520'-transparent -geometry +700+500 -compose over \) -composite \
    -blur 0x30 \
    /usr/share/backgrounds/corix-dark.png

WORKDIR /root

# XFCE config for macOS-like appearance
RUN mkdir -p /root/.config/xfce4/xfconf/xfce-perchannel-xml
COPY docker/xfce-config/xfce4-desktop.xml /root/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml
COPY docker/xfce-config/xfwm4.xml /root/.config/xfce4/xfconf/xfce-perchannel-xml/xfwm4.xml
COPY docker/xfce-config/xsettings.xml /root/.config/xfce4/xfconf/xfce-perchannel-xml/xsettings.xml
COPY docker/xfce-config/xfce4-panel.xml /root/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-panel.xml

# Terminal config: dark, with window frame
RUN mkdir -p /root/.config/xfce4/terminal && \
    printf '[Configuration]\nFontName=DejaVu Sans Mono 10\nColorBackground=#1a1a2e\nColorForeground=#e0e0e0\nBackgroundMode=TERMINAL_BACKGROUND_TRANSPARENT\nBackgroundDarkness=0.95\nScrollingBar=TERMINAL_SCROLLBAR_NONE\nMiscBordersDefault=TRUE\n' > /root/.config/xfce4/terminal/terminalrc

# Plank dock config (macOS-style bottom dock, always visible, large icons)
RUN mkdir -p /root/.config/plank/dock1/launchers && \
    printf '[PlankDockPreferences]\nHideMode=0\nTheme=Default\nPosition=3\nIconSize=56\nOffset=0\nAlignment=3\nItemsAlignment=3\nDockItems=google-chrome.dockitem;xfce4-terminal.dockitem;xfce4-file-manager.dockitem\n' > /root/.config/plank/dock1/settings && \
    printf '[PlankDockItemPreferences]\nLauncher=file:///usr/share/applications/google-chrome.desktop\n' > /root/.config/plank/dock1/launchers/google-chrome.dockitem && \
    printf '[PlankDockItemPreferences]\nLauncher=file:///usr/share/applications/xfce4-terminal.desktop\n' > /root/.config/plank/dock1/launchers/xfce4-terminal.dockitem && \
    printf '[PlankDockItemPreferences]\nLauncher=file:///usr/share/applications/thunar.desktop\n' > /root/.config/plank/dock1/launchers/xfce4-file-manager.dockitem

# Copy the agent
COPY agent/server.js /opt/corix-agent/server.js

# Startup script
COPY docker/entrypoint.sh /opt/corix-agent/entrypoint.sh
RUN chmod +x /opt/corix-agent/entrypoint.sh

EXPOSE 8420 6080

ENTRYPOINT ["/opt/corix-agent/entrypoint.sh"]

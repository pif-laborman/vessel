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

# Install Google Chrome
RUN curl -fsSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o /tmp/chrome.deb && \
    apt-get update && apt-get install -y /tmp/chrome.deb && \
    rm /tmp/chrome.deb && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install pre-built WhiteSur GTK theme (macOS Dark)
COPY docker/themes/gtk/WhiteSur-Dark /usr/share/themes/WhiteSur-Dark

# Install pre-built WhiteSur cursors
COPY docker/themes/cursors/WhiteSur-cursors /usr/share/icons/WhiteSur-cursors

# Create macOS-style wallpaper (dark gradient)
RUN convert -size 1280x720 \
    -define gradient:angle=135 \
    gradient:'#1a1a2e'-'#16213e' \
    /usr/share/backgrounds/vessel-dark.png

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

# Plank dock config (macOS-style bottom dock)
RUN mkdir -p /root/.config/plank/dock1/launchers && \
    printf '[PlankDockPreferences]\nHideMode=3\nTheme=Transparent\nPosition=3\nIconSize=48\nDockItems=google-chrome.dockitem;xfce4-terminal.dockitem;xfce4-file-manager.dockitem\n' > /root/.config/plank/dock1/settings && \
    printf '[PlankDockItemPreferences]\nLauncher=file:///usr/share/applications/google-chrome.desktop\n' > /root/.config/plank/dock1/launchers/google-chrome.dockitem && \
    printf '[PlankDockItemPreferences]\nLauncher=file:///usr/share/applications/xfce4-terminal.desktop\n' > /root/.config/plank/dock1/launchers/xfce4-terminal.dockitem && \
    printf '[PlankDockItemPreferences]\nLauncher=file:///usr/share/applications/thunar.desktop\n' > /root/.config/plank/dock1/launchers/xfce4-file-manager.dockitem

# Copy the agent
COPY agent/server.js /opt/vessel-agent/server.js

# Startup script
COPY docker/entrypoint.sh /opt/vessel-agent/entrypoint.sh
RUN chmod +x /opt/vessel-agent/entrypoint.sh

EXPOSE 8420

ENTRYPOINT ["/opt/vessel-agent/entrypoint.sh"]

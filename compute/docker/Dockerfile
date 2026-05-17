FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV DISPLAY=:99
ENV LANG=C.UTF-8

# Install desktop environment, Xvfb, utilities, and Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    xvfb \
    xfce4 \
    xfce4-terminal \
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
    firefox-esr \
    fonts-liberation \
    fonts-dejavu-core \
    ca-certificates \
    sudo \
    net-tools \
    htop \
    nano \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /root

# Copy the agent
COPY agent/server.js /opt/vessel-agent/server.js

# Startup script
COPY docker/entrypoint.sh /opt/vessel-agent/entrypoint.sh
RUN chmod +x /opt/vessel-agent/entrypoint.sh

EXPOSE 8420

ENTRYPOINT ["/opt/vessel-agent/entrypoint.sh"]

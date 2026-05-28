#!/bin/bash

# 🛡️ HFT INFRASTRUCTURE KERNEL TUNING SCRIPT
# Run this with sudo on your production Linux server for ultra-low latency.

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root"
   exit 1
fi

echo "🚀 Applying HFT-grade Kernel Optimizations..."

# Backup current sysctl.conf
cp /etc/sysctl.conf /etc/sysctl.conf.bak

# Append performance settings
cat <<EOT >> /etc/sysctl.conf

# --- HFT OPTIMIZATIONS ---
# Increase max open files
fs.file-max = 1000000

# Increase max concurrent connections
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192

# Port range for high concurrency
net.ipv4.ip_local_port_range = 1024 65535

# Fast recycling of TIME_WAIT sockets
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_tw_reuse = 1

# Disable TCP slow start after idle
net.ipv4.tcp_slow_start_after_idle = 0

# Increase TCP buffer sizes for high-frequency bursts
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# Enable TCP Fast Open
net.ipv4.tcp_fastopen = 3

# Low latency busy poll
net.core.busy_poll = 50
net.core.busy_read = 50

# --- END HFT OPTIMIZATIONS ---
EOT

# Apply changes
sysctl -p

echo "✅ Optimization applied successfully!"
echo "⚠️ Note: For full effect, ensure your NIC (Network Card) is using dedicated queues and CPU affinity is set for Node.js."

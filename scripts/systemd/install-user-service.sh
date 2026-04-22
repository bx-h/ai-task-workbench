#!/usr/bin/env bash
set -euo pipefail

unit_dir="${HOME}/.config/systemd/user"
mkdir -p "${unit_dir}"
cp "$(dirname "$0")/agentdock.service" "${unit_dir}/agentdock.service"
cp "$(dirname "$0")/agentdock-tunnel.service" "${unit_dir}/agentdock-tunnel.service"
systemctl --user daemon-reload
systemctl --user enable --now agentdock.service
systemctl --user enable --now agentdock-tunnel.service
systemctl --user status agentdock.service --no-pager
systemctl --user status agentdock-tunnel.service --no-pager

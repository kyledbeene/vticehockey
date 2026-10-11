#!/bin/zsh
# Usage: ./update-stats.sh [d2|d3|all] [--push]
# Pulls stats, shows what changed, and with --push commits and pushes just the stat CSVs.
cd "$(dirname "$0")"
mode=${1:-all}; [[ $mode == --push ]] && mode=all
python3 scripts/update_stats.py $mode || exit 1
git --no-pager diff --stat -- stats M2A/stats
if [[ " $* " == *" --push "* ]]; then
  git diff --quiet -- stats M2A/stats && { echo "No changes to commit."; exit 0; }
  git add stats M2A/stats && git commit -m "Update stats $(date +%Y-%m-%d)" && git push
fi

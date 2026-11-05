#!/usr/bin/env bash
# Links the skills in this repo into ~/.claude/skills so `git pull` updates them in place.
# Usage: ./install.sh            (override target with CLAUDE_SKILLS_DIR=/path ./install.sh)
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
mkdir -p "$DEST"
for skill in android-design; do
  target="$DEST/$skill"
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    backup="$target.bak.$(date +%Y%m%d%H%M%S)"
    mv "$target" "$backup"
    echo "moved existing $target -> $backup"
  fi
  ln -sfn "$SRC/$skill" "$target"
  echo "linked $target -> $SRC/$skill"
done
echo "done. Restart Claude Code (or open a new session) to load the skills."

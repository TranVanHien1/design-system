#!/usr/bin/env bash
# Links the skills in this repo into ~/.claude/skills so `git pull` updates them in place.
# Usage: ./install.sh            (override target with CLAUDE_SKILLS_DIR=/path ./install.sh)
# An existing non-link copy is moved to ~/.claude/skills-backup/ (outside the skills folder, so it is not loaded twice).
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
BACKUP="${CLAUDE_SKILLS_BACKUP:-$(dirname "$DEST")/skills-backup}"
mkdir -p "$DEST"
for skill in android-design android-adb-qa; do
  target="$DEST/$skill"
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    mkdir -p "$BACKUP"
    backup="$BACKUP/$skill.bak.$(date +%Y%m%d%H%M%S)"
    mv "$target" "$backup"
    echo "moved existing $target -> $backup"
  fi
  ln -sfn "$SRC/$skill" "$target"
  echo "linked $target -> $SRC/$skill"
done
echo "done. Restart Claude Code (or open a new session) to load the skills."

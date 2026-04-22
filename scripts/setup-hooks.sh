#!/usr/bin/env bash
# One-time setup to wire this repo's versioned hooks into Git.
#
# Git hooks live in .git/hooks by default, which is not tracked.
# Pointing core.hooksPath at .githooks lets the team share hooks via
# version control so every contributor runs the same checks.

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

git config core.hooksPath .githooks
chmod +x .githooks/*

echo "Git hooks wired to .githooks/"
echo "Installed hooks:"
ls -1 .githooks/

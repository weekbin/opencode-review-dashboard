#!/bin/bash
# Typecheck wrapper for subagents
# Usage: ./scripts/typecheck.sh
# This project uses bun — run typecheck via bun run typecheck
# (tsc is not in PATH; node_modules/.bin/tsc is the direct path)
bun run typecheck

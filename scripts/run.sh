#!/usr/bin/env bash
# Start the Poster Grid Inspector web server (analyze UI + API).
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "⚠  .env not found. Run: npm run setup"
  exit 1
fi

exec npm start

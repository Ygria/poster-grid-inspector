#!/usr/bin/env bash
# Install dependencies and prepare a local .env from the example (no secrets included).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Installing dependencies..."
npm install

if [ ! -f .env ]; then
  cp .env.example .env
  echo "→ Created .env from .env.example"
  echo "  Edit .env and set AI_PROVIDER / AI_API_KEY / AI_BASE_URL / AI_MODEL"
else
  echo "→ .env already exists (leaving it untouched)"
fi

echo "✓ Setup complete. Run: npm start"

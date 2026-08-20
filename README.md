# Poster Grid Inspector — AI Poster Grid Analysis Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Analyze the underlying **layout grid system** of any poster / design image with a vision model,
then view the grid overlaid on the image and **export it as SVG guides or CSS Grid / Tailwind code**.

This project ships as an **installable AI agent skill** (`SKILL.md` + runnable server/CLI), so code
agents (Claude Code, Cursor, Windsurf, etc.) can invoke it. It is **model-agnostic** — works with
OpenAI or any OpenAI-compatible multimodal model (GPT, Qwen-VL, …). **No API keys are bundled or
committed** — you provide your own via `.env`.

## Features

- 🖼️ Detects grid system type (Swiss modular, N-column, asymmetric, baseline, golden ratio,
  rule of thirds, diagonal, radial, freeform…), confidence, grid parameters, detected elements,
  keylines, color palette.
- 🎨 Web UI: upload image → analyze → **live grid overlay** on the poster (columns / rows /
  margins / baseline / keylines / element boxes, toggleable).
- 📐 Export: **SVG grid guide** (importable into Figma / Illustrator) with per-layer toggles, or
  **CSS Grid / Tailwind** code — copied or downloaded.
- ⚡ CLI: `npm run analyze -- ./poster.jpg --summary` — no server needed.
- 🔌 Model-agnostic providers (OpenAI Responses + OpenAI-compatible Chat Completions), timeout,
  one retry, validation, and in-memory caching.

## Install as a skill

The whole repo is a skill directory. Copy it (or clone) into your agent's skills folder:

- **Claude Code (project):** `.claude/skills/poster-grid-inspector/`
- **Claude Code (user):** `~/.claude/skills/poster-grid-inspector/`
- **Cursor / Windsurf:** follow each editor's skill directory convention
  (the `SKILL.md` frontmatter `name` + `description` is the standard agents read)

Or run it as a plain web app (no agent needed) — see [Quick start](#quick-start).

## Quick start

```bash
git clone <this repo> poster-grid-inspector
cd poster-grid-inspector
npm run setup          # install deps + create .env from .env.example
# edit .env — set AI_PROVIDER / AI_API_KEY / AI_BASE_URL / AI_MODEL (see below)
npm start              # open http://localhost:8787
```

### CLI analysis (no server)

```bash
npm run analyze -- ./poster.jpg --summary   # concise
npm run analyze -- ./poster.png             # full JSON
```

## Configuration (`.env`)

| Env var | Default | Notes |
|---|---|---|
| `AI_PROVIDER` | `openai` | `openai` or `openai-compatible` |
| `AI_API_KEY` | — | **required** |
| `AI_BASE_URL` | `https://api.openai.com/v1` | for compatible providers |
| `AI_MODEL` | `gpt-5.6-terra` | use a vision model available to your key |
| `AI_RESPONSE_FORMAT` | `json_schema` | `json_schema` or `json_object` (Qwen) |
| `AI_IMAGE_DETAIL` | `original` | `low` / `high` / `auto` / `original` |
| `AI_ENABLE_THINKING` | `false` | Qwen `enable_thinking` |
| `AI_TIMEOUT_MS` | `35000` | per-request timeout |
| `AI_TOTAL_DEADLINE_MS` | `50000` | total deadline incl. retries |
| `PORT` | `8787` | web server port |

Example — OpenAI:

```env
AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_RESPONSE_FORMAT=json_schema
```

Example — Qwen / OpenAI-compatible:

```env
AI_PROVIDER=openai-compatible
AI_API_KEY=...
AI_BASE_URL=https://your-endpoint/v1
AI_MODEL=qwen3-vl-plus
AI_RESPONSE_FORMAT=json_object
AI_ENABLE_THINKING=false
```

> ⚠️ The provider **must accept image input**. Text-only APIs (e.g. DeepSeek) fail with
> `unknown variant 'image_url'`.

## API

```
POST /api/analyze-grid
{ "imageBase64": "<base64>", "mimeType": "image/jpeg" }
```

Returns the analysis (`systemType`, `confidence`, `gridParams`, `detectedElements`, `keylines`,
…). All coordinates are **percentages (0–100)**. Full response shape in [`SKILL.md`](SKILL.md).
Also `/health` for a liveness/config check.

## Security

- API keys live **only** in your local `.env` (git-ignored). The repo ships `.env.example`
  with empty placeholders.
- The frontend never sees or sends your key; calls go through the local server.

## Layout

```
SKILL.md                agent skill entry (frontmatter + usage guide)
server.ts               web server entry (Express + static + /api/analyze-grid + /health)
public/                 frontend UI (vanilla HTML/JS, no bundler)
server/ai/              config, providers (OpenAI / OpenAI-compatible), schema, normalize, cache
server/routes/          analyze-grid route
src/                    types + client-side helpers (visionImage, analyzeGridApi, gridScoring)
api/                    Vercel Express example
scripts/                setup.sh, run.sh, analyze.mts (CLI)
```

## Notes / Credits

- Built as a model-agnostic reimplementation of the analysis layer of the
  [Poster Grid Inspector](https://github.com/beyondbetterbrand/poster-grid-inspector) concept,
  replacing its Gemini coupling. UI/export flows reference the upstream project's UX.
- MIT licensed — see [LICENSE](LICENSE).

---
name: poster-grid-inspector
description: >-
  Analyze a poster or layout design image to detect its underlying grid system and export grid
  guide overlays. Use when the user wants to (1) identify the layout grid of a poster/design image
  (Swiss modular, N-column, asymmetric, baseline, golden ratio, rule of thirds, diagonal, radial,
  freeform, etc.), (2) get detected layout elements, keylines, and alignment notes, or (3) export
  the detected grid as an SVG overlay file or CSS Grid / Tailwind code. Works with any OpenAI or
  OpenAI-compatible multimodal model (GPT, Qwen-VL, etc.) via the AI_PROVIDER / AI_API_KEY env vars.
---

# Poster Grid Inspector

Model-agnostic poster grid analysis skill. It detects the underlying layout grid system of a
poster/design image using a vision model, then lets you view the grid overlaid on the image and
export it as SVG guides (Figma/Illustrator friendly) or CSS Grid / Tailwind code.

## What it includes

- `server/` — Express API + model-agnostic AI analysis layer (`POST /api/analyze-grid`)
  - `server/ai/providers/openai.ts` — OpenAI Responses API
  - `server/ai/providers/openaiCompatible.ts` — Qwen / any OpenAI-compatible Chat Completions
  - `server/ai/analyzePoster.ts` — timeout, one retry, in-memory cache, normalization, validation
- `public/` — web UI: upload image → analyze → live grid overlay → export SVG / CSS
- `scripts/analyze.mts` — CLI: analyze an image file directly, no server needed
- `api/index.ts` — Vercel/Serverless Express entry (same analysis service)

## Prerequisites

- Node.js >= 18 (native `fetch` is used; no AI SDK dependency)
- A vision-capable model API key:
  - **OpenAI**: `AI_PROVIDER=openai`, `AI_API_KEY=sk-...`, `AI_MODEL=<vision model>`
  - **Qwen / others**: `AI_PROVIDER=openai-compatible`, `AI_API_KEY=...`,
    `AI_BASE_URL=https://your-endpoint/v1`, `AI_MODEL=qwen3-vl-plus` (or similar)
- The provider must accept image input. Text-only APIs (e.g. DeepSeek) will fail.

## Setup

```bash
npm run setup      # npm install + create .env from .env.example
# then edit .env: set AI_PROVIDER, AI_API_KEY, AI_BASE_URL, AI_MODEL
```

`.env` is git-ignored. Never commit real API keys.

| Env var | Default | Notes |
|---|---|---|
| `AI_PROVIDER` | `openai` | `openai` or `openai-compatible` |
| `AI_API_KEY` | — | **required** |
| `AI_BASE_URL` | `https://api.openai.com/v1` | for compatible providers |
| `AI_MODEL` | `gpt-5.6-terra` | use a vision model available to your key |
| `AI_RESPONSE_FORMAT` | `json_schema` | `json_schema` or `json_object` (Qwen) |
| `AI_IMAGE_DETAIL` | `original` | `low` / `high` / `auto` / `original` |
| `AI_ENABLE_THINKING` | `false` | Qwen `enable_thinking` |
| `AI_TIMEOUT_MS` / `AI_TOTAL_DEADLINE_MS` | `35000` / `50000` | |
| `PORT` | `8787` | web server port |

## Usage

### 1. Web UI (recommended for interactive use)

```bash
npm start
# open http://localhost:8787
```

Flow: upload a poster image → click **分析网格系统** → the grid overlays the image live
(columns / rows / margins / baseline / keylines / element boxes, toggles above the preview) →
click **导出网格** to download an SVG guide or copy CSS Grid / Tailwind code.

The frontend preprocesses images to ~1600px JPEG (quality 0.9) before sending, matching
`src/utils/visionImage.ts`.

### 2. CLI

```bash
npm run analyze -- ./poster.jpg --summary   # concise result
npm run analyze -- ./poster.png             # full JSON
```

The CLI calls the analysis pipeline directly; the server does not need to be running.
Note: the CLI sends the file as-is (no resizing) — very large images may need pre-processing.

### 3. API

```
POST /api/analyze-grid
Content-Type: application/json

{ "imageBase64": "<base64 without data: prefix>", "mimeType": "image/jpeg" }
```

Response:

```json
{
  "success": true,
  "data": {
    "systemType": "swiss_modular",
    "systemName": "瑞士模块化网格",
    "confidence": 87,
    "title": "...",
    "summary": "...",
    "gridParams": { "columns": 12, "rows": 8, "marginTop": 8, "...": "..." },
    "detectedElements": [{ "id": "e1", "label": "...", "type": "headline", "x": 46, "y": 3, "width": 49, "height": 10, "alignmentNote": "..." }],
    "keylines": [{ "id": "k1", "type": "vertical", "position": 50, "label": "..." }],
    "swissPrinciples": ["..."],
    "typeHierarchyRating": "A级...",
    "whitespaceRatio": "24%",
    "colorPalette": ["#161012", "#F0D93B"]
  },
  "meta": { "provider": "openai", "model": "gpt-5.4-mini", "latencyMs": 13313, "cached": false, "promptVersion": "poster-grid-v2", "schemaVersion": "poster-grid-schema-v2" }
}
```

Coordinates in `gridParams` / `detectedElements` / `keylines` are **percentages (0–100)**
relative to the image. UI drawing fields (`color`, `opacity`, `strokeWidth`, show-* toggles) are
filled by the frontend, not the model.

## Model-agnostic notes

- The OpenAI provider uses the **Responses API** (`/responses`). The compatible provider uses
  **Chat Completions** (`/chat/completions`) and optionally sends `enable_thinking=false`.
- Different compatible vendors differ on `enable_thinking`, `json_schema`, and image field
  support; adapt in `server/ai/providers/*.ts` if needed.
- An in-memory cache keys on image + provider + model + promptVersion + schemaVersion. Identical
  repeated requests are served from cache (not a permanent cache on Serverless).

## Troubleshooting

- `AI_API_KEY is required` → `.env` not configured (run `npm run setup` and fill it in).
- `unknown variant 'image_url'` → the configured provider/model does not accept images; use a
  vision model (DeepSeek text models will fail like this).
- `429 insufficient_quota` → your API account has no credits for that model; pick a model your
  plan covers or top up billing.
- `429` retried then failed → rate limit; back off or raise `AI_TOTAL_DEADLINE_MS`.

## Layout

```
SKILL.md               this file
server.ts              web server entry (Express + static + /api/analyze-grid + /health)
public/                frontend UI (vanilla HTML/JS, no bundler)
server/ai/             config, providers, schema, normalize, cache, analyzePoster
server/routes/         analyze-grid route
src/                   types + client-side helpers (visionImage, analyzeGridApi, gridScoring)
api/                   Vercel Express example
scripts/               setup.sh, run.sh, analyze.mts (CLI)
```

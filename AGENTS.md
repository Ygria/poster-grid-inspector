# AGENTS.md

Guidance for AI coding agents working in this repository. Read this before modifying code.

## What this repo is

A model-agnostic **poster grid analysis** tool. The installable skill uses the host model's native
vision capability by default. Its optional web/CLI mode sends a poster image to a vision model
(OpenAI or any OpenAI-compatible provider), gets back the layout's grid system, parameters,
detected elements, keylines, and analysis — then renders the grid overlaid on the image and can
export it as SVG guides or CSS Grid / Tailwind code.

It ships as an **installable agent skill** (`SKILL.md`) plus a runnable web app / CLI.

## Commands

```bash
npm run setup        # install deps + copy .env.example → .env (never edit .env.example with real keys)
npm start            # run the web server (http://localhost:8787)
npm run dev          # tsx watch (auto-reload)
npm run analyze -- <image> [--summary]   # CLI analysis, no server needed
npm run typecheck    # tsc --noEmit
```

TypeScript is run directly with `tsx` (no build step). `.js` in import paths maps to `.ts`.

## Architecture

- `server.ts` — Express entry: `express.json({limit:'25mb'})`, static `public/`, `analyzeGridRouter`,
  `GET /health`.
- `server/routes/analyzeGrid.ts` — `POST /api/analyze-grid` route (validates `imageBase64`, calls
  `analyzePoster`, maps `AiError` → HTTP).
- `server/ai/analyzePoster.ts` — orchestration: cache → provider call (timeout + 1 retry) →
  normalize → validate → return `{ data, meta }`.
- `server/ai/providers/openai.ts` — Responses API (`/responses`, `input_image`, strict
  `json_schema`). `openaiCompatible.ts` — Chat Completions (`/chat/completions`, `image_url`,
  `json_object`/`json_schema`, optional `enable_thinking`). `http.ts` — `fetch` wrapper.
- `server/ai/config.ts` — `.env` → `AiConfig`. Remote analysis is blocked unless
  `AI_REMOTE_ANALYSIS=1`; `getAiConfig()` then throws if `AI_API_KEY` is missing.
- `server/ai/schema.ts` — `POSTER_ANALYSIS_JSON_SCHEMA` + runtime `validatePosterAnalysis`.
- `server/ai/normalize.ts` — strip JSON fences, clean coordinates, migrate `systemNameKo` → `systemName`.
- `server/ai/cache.ts` — in-memory Map; key = sha256(image + provider + model + promptVersion + schemaVersion).
- `public/index.html` — self-contained frontend (no bundler): upload → analyze → overlay → export.
- `src/` — shared types (`posterVision.ts`), client helpers (`visionImage.ts`, `analyzeGridApi.ts`,
  `gridScoring.ts`).

## Conventions

- **All coordinates are percentages 0–100** of the image: `gridParams`, `detectedElements[x/y/w/h]`,
  `keylines[position]`.
- **UI drawing fields are frontend-filled, never model-returned**: `color`, `opacity`,
  `strokeWidth`, `showBaseline/showColumns/...` are added by `public/index.html`
  (`displayGridParams()`), not requested from the model.
- ESM with `.js` extension in imports. TypeScript type imports must use `import type` where needed.
- `AiError` has `{ code, status, retryable, cause }`. `classifyHttpError` maps provider HTTP
  errors to `AiError`.
- The OpenAI provider's model config uses `max_output_tokens: 5000`.

## Gotchas

- **Provider must accept images.** Text-only APIs (e.g. DeepSeek) return
  `unknown variant 'image_url'`. Never "fix" this by stripping image content — the whole point
  is vision analysis.
- A key may get `429 insufficient_quota` for one model but work on another (e.g. `gpt-4o-mini`
  vs `gpt-5.6-terra`). When testing, prefer a model the key's plan covers.
- `AI_RESPONSE_FORMAT=json_schema` isn't supported by every compatible vendor — use
  `json_object` for Qwen unless known otherwise.
- Changing `.env` does not trigger `tsx watch` reload; restart the server after editing it.
- In-memory cache: identical image requests within a session are served from cache
  (`meta.cached: true`). On Serverless this is per-instance only.

## Security (mandatory)

- **Never commit `.env` or real API keys.** `.env` is git-ignored; only `.env.example`
  (empty keys) is committed.
- `.claude/settings.local.json` can contain recorded command history with secrets — keep it
  git-ignored.
- Before pushing: `grep -rn` for `sk-` / known key patterns and audit `git ls-files` / staged
  index (`git grep --cached`).
- The frontend must never embed the API key; all AI calls go through the server.

## Deploying

`api/index.ts` is a Vercel Express entry reusing the same analysis service. It reads the same
`.env` vars (set them as Vercel environment variables). The in-memory cache is per-instance on
Serverless — expected.

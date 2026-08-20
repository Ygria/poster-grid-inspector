import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import { analyzeGridRouter } from './server/routes/analyzeGrid.js';

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(import.meta.dirname, 'public')));

// Minimal sanity endpoints for the test harness.
app.get('/', (_req, res) => res.json({ name: 'poster-grid-inspector-api-test', ok: true }));
app.get('/health', (_req, res) => res.json({ ok: true, provider: process.env.AI_PROVIDER || 'openai', model: process.env.AI_MODEL || '' }));

app.use(analyzeGridRouter);

const PORT = Number(process.env.PORT || 8787);
app.listen(PORT, () => {
  console.log(`[poster-grid-inspector] API listening on http://localhost:${PORT}`);
});

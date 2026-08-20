// CLI: analyze a poster image file directly (no server required).
//
// Usage:
//   npm run analyze -- <image-path> [--summary]
//
// Reads the file, sends it base64 to the optional remote AI analysis pipeline and prints the result.
// Requires AI_REMOTE_ANALYSIS=1 and a configured .env (see npm run setup).
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { analyzePoster } from '../server/ai/analyzePoster.js';

const file = process.argv[2];
if (!file) {
  console.error('Usage: npm run analyze -- <image-path> [--summary]');
  process.exit(1);
}

const mime =
  file.toLowerCase().endsWith('.png') ? 'image/png'
  : file.toLowerCase().endsWith('.webp') ? 'image/webp'
  : 'image/jpeg';

const base64 = (await readFile(file)).toString('base64');
let out;
try {
  out = await analyzePoster(base64, mime);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

if (process.argv.includes('--summary')) {
  const d = out.data;
  console.log(JSON.stringify({
    systemType: d.systemType,
    systemName: d.systemName,
    confidence: d.confidence,
    elements: d.detectedElements.length,
    keylines: d.keylines.length,
    whitespaceRatio: d.whitespaceRatio,
    cached: out.meta.cached,
    provider: out.meta.provider,
    model: out.meta.model,
  }, null, 2));
} else {
  console.log(JSON.stringify(out, null, 2));
}

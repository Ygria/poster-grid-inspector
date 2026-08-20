export interface AiConfig {
  provider: 'openai' | 'openai-compatible';
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
  totalDeadlineMs: number;
  maxRetries: number;
  imageDetail: 'low' | 'high' | 'auto' | 'original';
  responseFormat: 'json_schema' | 'json_object';
  enableThinking: boolean;
  promptVersion: string;
  schemaVersion: string;
}

function intEnv(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}
function boolEnv(name: string, fallback: boolean): boolean {
  const v = process.env[name];
  if (v == null) return fallback;
  return ['1','true','yes','on'].includes(v.toLowerCase());
}

export function getAiConfig(): AiConfig {
  const provider = (process.env.AI_PROVIDER || 'openai') as AiConfig['provider'];
  if (!['openai','openai-compatible'].includes(provider)) {
    throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }
  const apiKey = process.env.AI_API_KEY || '';
  if (!apiKey) throw new Error('AI_API_KEY is required');
  return {
    provider,
    apiKey,
    baseUrl: (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, ''),
    model: process.env.AI_MODEL || 'gpt-5.6-terra',
    timeoutMs: intEnv('AI_TIMEOUT_MS', 35000),
    totalDeadlineMs: intEnv('AI_TOTAL_DEADLINE_MS', 50000),
    maxRetries: Math.min(1, intEnv('AI_MAX_RETRIES', 1)),
    imageDetail: (process.env.AI_IMAGE_DETAIL || 'original') as AiConfig['imageDetail'],
    responseFormat: (process.env.AI_RESPONSE_FORMAT || 'json_schema') as AiConfig['responseFormat'],
    enableThinking: boolEnv('AI_ENABLE_THINKING', false),
    promptVersion: process.env.PROMPT_VERSION || 'poster-grid-v2',
    schemaVersion: process.env.SCHEMA_VERSION || 'poster-grid-schema-v2',
  };
}

import { AiConfig } from '../config.js'; import { VisionProvider } from '../types.js';
import { OpenAIResponsesProvider } from './openai.js'; import { OpenAICompatibleProvider } from './openaiCompatible.js';
export function createVisionProvider(cfg:AiConfig):VisionProvider{
  return cfg.provider==='openai-compatible' ? new OpenAICompatibleProvider(cfg) : new OpenAIResponsesProvider(cfg);
}

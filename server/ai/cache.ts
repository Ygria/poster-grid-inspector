import crypto from 'crypto'; import { AiConfig } from './config.js'; import { PosterVisionAnalysis } from './types.js';
export interface CacheEntry{data:PosterVisionAnalysis;createdAt:string;provider:string;model:string;latencyMs:number;usage?:unknown;}
const cache=new Map<string,CacheEntry>();
export function makeCacheKey(image:string,cfg:AiConfig){return crypto.createHash('sha256').update([image,cfg.provider,cfg.model,cfg.promptVersion,cfg.schemaVersion].join('\n')).digest('hex');}
export function getCache(k:string){return cache.get(k);}
export function setCache(k:string,v:CacheEntry){if(cache.size>=75)cache.delete(cache.keys().next().value as string);cache.set(k,v);}

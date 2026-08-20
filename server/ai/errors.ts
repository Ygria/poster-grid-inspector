export class AiError extends Error {
  constructor(public code:string, message:string, public status=502, public retryable=false, public cause?:unknown){super(message);}
}
export function classifyHttpError(status:number, body:string):AiError{
  if(status===401||status===403) return new AiError('AI_AUTH_ERROR','AI 服务鉴权失败，请检查 API Key。',status,false,body);
  if(status===408) return new AiError('AI_TIMEOUT','AI 服务请求超时。',504,true,body);
  if(status===413) return new AiError('IMAGE_TOO_LARGE','发送给 AI 的图片过大。',413,false,body);
  if(status===429) return new AiError('AI_RATE_LIMIT','AI 服务请求频率受限，请稍后重试。',429,true,body);
  if([500,502,503,504].includes(status)) return new AiError('AI_UPSTREAM_ERROR','AI 服务暂时不可用。',502,true,body);
  return new AiError('AI_REQUEST_ERROR',`AI 请求失败 (${status})。`,502,false,body);
}

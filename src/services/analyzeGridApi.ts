export interface AnalyzeGridMeta { provider:string; model:string; latencyMs:number; cached:boolean; promptVersion:string; schemaVersion:string; requestId?:string; }
export interface AnalyzeGridResponse<T>{success:true;data:T;meta:AnalyzeGridMeta}
export class AnalyzeGridApiError extends Error{constructor(public code:string,message:string,public retryable:boolean,public status:number){super(message)}}
let activeController:AbortController|null=null; let sequence=0;
export async function analyzeGrid<T>(imageBase64:string,mimeType:string,timeoutMs=50000):Promise<{response:AnalyzeGridResponse<T>;sequence:number}>{
  activeController?.abort(); const controller=new AbortController(); activeController=controller; const seq=++sequence; const t=setTimeout(()=>controller.abort(),timeoutMs);
  try{const r=await fetch('/api/analyze-grid',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageBase64,mimeType}),signal:controller.signal}); const j=await r.json().catch(()=>({})); if(!r.ok||!j.success)throw new AnalyzeGridApiError(j.code||'API_ERROR',j.error||`分析失败 (${r.status})`,Boolean(j.retryable),r.status); return {response:j,sequence:seq};}catch(e:any){if(e?.name==='AbortError')throw new AnalyzeGridApiError('AI_TIMEOUT','分析超时或已取消。',true,504);throw e;}finally{clearTimeout(t);if(activeController===controller)activeController=null;}
}
export function cancelAnalyzeGrid(){activeController?.abort();activeController=null;}
export function isLatestAnalyzeSequence(seq:number){return seq===sequence;}

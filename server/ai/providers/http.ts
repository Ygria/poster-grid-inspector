import { AiError, classifyHttpError } from '../errors.js';

export async function fetchJsonWithTimeout(url:string, init:RequestInit, timeoutMs:number, parent?:AbortSignal):Promise<{json:any; headers:Headers}> {
  const c=new AbortController();
  const onAbort=()=>c.abort(parent?.reason); parent?.addEventListener('abort',onAbort,{once:true});
  const t=setTimeout(()=>c.abort(new Error('timeout')),timeoutMs);
  try{
    const r=await fetch(url,{...init,signal:c.signal}); const text=await r.text();
    if(!r.ok) throw classifyHttpError(r.status,text.slice(0,2000));
    let json:any; try{json=JSON.parse(text);}catch{throw new AiError('AI_INVALID_RESPONSE','AI 服务返回了非 JSON 响应。',502,true,text.slice(0,1000));}
    return {json,headers:r.headers};
  }catch(err:any){
    if(err instanceof AiError) throw err;
    if(c.signal.aborted) throw new AiError('AI_TIMEOUT','海报分析超时或已取消。',504,true,err);
    throw new AiError('AI_NETWORK_ERROR','无法连接 AI 服务。',502,true,err);
  }finally{clearTimeout(t); parent?.removeEventListener('abort',onAbort);}
}

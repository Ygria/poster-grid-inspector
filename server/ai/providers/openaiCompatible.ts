import { AiConfig } from '../config.js';
import { POSTER_ANALYSIS_JSON_SCHEMA } from '../schema.js';
import { POSTER_ANALYSIS_PROMPT } from '../prompt.js';
import { ProviderResult, VisionAnalysisInput, VisionProvider } from '../types.js';
import { fetchJsonWithTimeout } from './http.js';

export class OpenAICompatibleProvider implements VisionProvider {
  readonly name='openai-compatible'; constructor(private cfg:AiConfig){}
  async analyzePoster(input:VisionAnalysisInput):Promise<ProviderResult>{
    const response_format=this.cfg.responseFormat==='json_schema'
      ? {type:'json_schema',json_schema:{name:'poster_grid_analysis',strict:true,schema:POSTER_ANALYSIS_JSON_SCHEMA}}
      : {type:'json_object'};
    const body:any={model:this.cfg.model,temperature:0,messages:[{role:'user',content:[
      {type:'image_url',image_url:{url:`data:${input.mimeType};base64,${input.imageBase64}`}},
      {type:'text',text:POSTER_ANALYSIS_PROMPT}
    ]}],response_format};
    if(!this.cfg.enableThinking) body.enable_thinking=false;
    const {json,headers}=await fetchJsonWithTimeout(`${this.cfg.baseUrl}/chat/completions`,{method:'POST',headers:{Authorization:`Bearer ${this.cfg.apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(body)},this.cfg.timeoutMs,input.signal);
    return {data:json.choices?.[0]?.message?.content,provider:this.name,model:this.cfg.model,usage:json.usage,requestId:json.id||headers.get('x-request-id')||undefined};
  }
}

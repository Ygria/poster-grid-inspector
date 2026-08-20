import { AiConfig } from '../config.js';
import { POSTER_ANALYSIS_JSON_SCHEMA } from '../schema.js';
import { POSTER_ANALYSIS_PROMPT, POSTER_ANALYSIS_USER_PROMPT } from '../prompt.js';
import { ProviderResult, VisionAnalysisInput, VisionProvider } from '../types.js';
import { fetchJsonWithTimeout } from './http.js';

export class OpenAIResponsesProvider implements VisionProvider {
  readonly name='openai'; constructor(private cfg:AiConfig){}
  async analyzePoster(input:VisionAnalysisInput):Promise<ProviderResult>{
    const {json,headers}=await fetchJsonWithTimeout(`${this.cfg.baseUrl}/responses`,{
      method:'POST',headers:{Authorization:`Bearer ${this.cfg.apiKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({model:this.cfg.model,input:[
        {role:'system',content:[{type:'input_text',text:POSTER_ANALYSIS_PROMPT}]},
        {role:'user',content:[{type:'input_image',image_url:`data:${input.mimeType};base64,${input.imageBase64}`,detail:this.cfg.imageDetail},{type:'input_text',text:POSTER_ANALYSIS_USER_PROMPT}]}
      ],text:{format:{type:'json_schema',name:'poster_grid_analysis',strict:true,schema:POSTER_ANALYSIS_JSON_SCHEMA}},max_output_tokens:5000}),
    },this.cfg.timeoutMs,input.signal);
    const text=json.output_text ?? json.output?.flatMap((o:any)=>o.content||[]).find((c:any)=>c.type==='output_text')?.text;
    return {data:text,provider:this.name,model:this.cfg.model,usage:json.usage,requestId:json.id||headers.get('x-request-id')||undefined};
  }
}

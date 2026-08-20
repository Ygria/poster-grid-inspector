import { GRID_SYSTEM_TYPES, PosterVisionAnalysis, VisionDetectedElement } from './types.js';

const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
const r1=(n:number)=>Math.round(n*10)/10;

export function stripJsonFence(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
}

export function normalizePosterAnalysis(raw: any): PosterVisionAnalysis {
  const out = structuredClone(raw || {});
  out.systemName = String(out.systemName || out.systemNameKo || '推断网格系统');
  out.systemType = GRID_SYSTEM_TYPES.includes(out.systemType) ? out.systemType : 'freeform_organic';
  let c = Number(out.confidence);
  if (!Number.isFinite(c)) c = 50;
  if (c >= 0 && c <= 1) c *= 100;
  out.confidence = Math.round(clamp(c,0,100));
  const g=out.gridParams ||= {};
  g.columns=Math.round(clamp(Number(g.columns)||1,1,24)); g.rows=Math.round(clamp(Number(g.rows)||1,1,24));
  for(const k of ['marginTop','marginBottom','marginLeft','marginRight']) g[k]=r1(clamp(Number(g[k])||0,0,50));
  for(const k of ['columnGutter','rowGutter']) g[k]=r1(clamp(Number(g[k])||0,0,20));
  g.baselineSpacing=r1(clamp(Number(g.baselineSpacing)||2,0.5,10)); g.diagonalAngle=r1(clamp(Number(g.diagonalAngle)||0,-45,45));
  const seen=new Set<string>();
  out.detectedElements=(Array.isArray(out.detectedElements)?out.detectedElements:[]).slice(0,24).map((el:any,i:number):VisionDetectedElement=>{
    let id=String(el.id||`el_${String(i+1).padStart(2,'0')}`); while(seen.has(id)) id=`${id}_${i+1}`; seen.add(id);
    const x=r1(clamp(Number(el.x)||0,0,100)); const y=r1(clamp(Number(el.y)||0,0,100));
    const width=r1(clamp(Number(el.width)||0.2,0.2,100-x)); const height=r1(clamp(Number(el.height)||0.2,0.2,100-y));
    return {id,label:String(el.label||'未命名视觉元素'),type:el.type,x,y,width,height,alignmentNote:String(el.alignmentNote||'未识别到稳定对齐关系')};
  });
  out.keylines=(Array.isArray(out.keylines)?out.keylines:[]).slice(0,16).map((k:any,i:number)=>({id:String(k.id||`kl_${i+1}`),type:k.type==='horizontal'?'horizontal':'vertical',position:r1(clamp(Number(k.position)||0,0,100)),label:String(k.label||'关键对齐线')}));
  out.swissPrinciples=(Array.isArray(out.swissPrinciples)?out.swissPrinciples:[]).map(String).slice(0,8);
  out.colorPalette=(Array.isArray(out.colorPalette)?out.colorPalette:[]).map((x:any)=>String(x).toUpperCase()).filter((x:string)=>/^#[0-9A-F]{6}$/.test(x)).slice(0,8);
  out.title=String(out.title||'海报网格分析'); out.summary=String(out.summary||''); out.typeHierarchyRating=String(out.typeHierarchyRating||'B级：层级基本明确');
  let ws=String(out.whitespaceRatio||'0%'); if(/^\d+(?:\.\d+)?$/.test(ws)) ws=`${ws}%`; out.whitespaceRatio=ws;
  delete out.systemNameKo; delete out.candidateGrids;
  return out as PosterVisionAnalysis;
}

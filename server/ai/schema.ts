import { ELEMENT_TYPES, GRID_SYSTEM_TYPES, PosterVisionAnalysis } from './types.js';

export const POSTER_ANALYSIS_JSON_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['systemType','systemName','confidence','title','summary','gridParams','detectedElements','keylines','swissPrinciples','typeHierarchyRating','whitespaceRatio','colorPalette'],
  properties: {
    systemType: { type: 'string', enum: [...GRID_SYSTEM_TYPES] },
    systemName: { type: 'string' },
    confidence: { type: 'number', minimum: 0, maximum: 100 },
    title: { type: 'string' }, summary: { type: 'string' },
    gridParams: {
      type: 'object', additionalProperties: false,
      required: ['columns','rows','marginTop','marginBottom','marginLeft','marginRight','columnGutter','rowGutter','baselineSpacing','diagonalAngle'],
      properties: {
        columns:{type:'integer',minimum:1,maximum:24}, rows:{type:'integer',minimum:1,maximum:24},
        marginTop:{type:'number',minimum:0,maximum:50}, marginBottom:{type:'number',minimum:0,maximum:50},
        marginLeft:{type:'number',minimum:0,maximum:50}, marginRight:{type:'number',minimum:0,maximum:50},
        columnGutter:{type:'number',minimum:0,maximum:20}, rowGutter:{type:'number',minimum:0,maximum:20},
        baselineSpacing:{type:'number',minimum:0.5,maximum:10}, diagonalAngle:{type:'number',minimum:-45,maximum:45},
      },
    },
    detectedElements: {
      type:'array', minItems:1, maxItems:24,
      items:{type:'object',additionalProperties:false,required:['id','label','type','x','y','width','height','alignmentNote'],properties:{
        id:{type:'string'},label:{type:'string'},type:{type:'string',enum:[...ELEMENT_TYPES]},
        x:{type:'number',minimum:0,maximum:100},y:{type:'number',minimum:0,maximum:100},
        width:{type:'number',exclusiveMinimum:0,maximum:100},height:{type:'number',exclusiveMinimum:0,maximum:100},alignmentNote:{type:'string'}
      }}
    },
    keylines:{type:'array',maxItems:16,items:{type:'object',additionalProperties:false,required:['id','type','position','label'],properties:{
      id:{type:'string'},type:{type:'string',enum:['vertical','horizontal']},position:{type:'number',minimum:0,maximum:100},label:{type:'string'}
    }}},
    swissPrinciples:{type:'array',minItems:1,maxItems:8,items:{type:'string'}},
    typeHierarchyRating:{type:'string'},
    whitespaceRatio:{type:'string',pattern:'^(100(?:\\.0+)?|[0-9]{1,2}(?:\\.[0-9]+)?)%$'},
    colorPalette:{type:'array',minItems:1,maxItems:8,items:{type:'string',pattern:'^#[0-9A-Fa-f]{6}$'}},
  },
} as const;

export function validatePosterAnalysis(input: unknown): { ok: true; data: PosterVisionAnalysis } | { ok: false; errors: string[] } {
  const e: string[] = [];
  if (!input || typeof input !== 'object') return { ok:false, errors:['root must be object'] };
  const x = input as Record<string, any>;
  if (!GRID_SYSTEM_TYPES.includes(x.systemType)) e.push('invalid systemType');
  for (const k of ['systemName','title','summary','typeHierarchyRating','whitespaceRatio']) if (typeof x[k] !== 'string' || !x[k]) e.push(`${k} must be non-empty string`);
  if (!Number.isFinite(x.confidence)) e.push('confidence must be finite number');
  const g = x.gridParams;
  if (!g || typeof g !== 'object') e.push('gridParams missing');
  else {
    for (const k of ['columns','rows','marginTop','marginBottom','marginLeft','marginRight','columnGutter','rowGutter','baselineSpacing','diagonalAngle']) if (!Number.isFinite(g[k])) e.push(`gridParams.${k} invalid`);
  }
  if (!Array.isArray(x.detectedElements) || x.detectedElements.length < 1) e.push('detectedElements missing');
  else x.detectedElements.forEach((el:any,i:number)=>{
    if (!ELEMENT_TYPES.includes(el.type)) e.push(`detectedElements[${i}].type invalid`);
    for (const k of ['x','y','width','height']) if (!Number.isFinite(el[k])) e.push(`detectedElements[${i}].${k} invalid`);
    if (Number.isFinite(el.x)&&Number.isFinite(el.width)&&el.x+el.width>100.01) e.push(`detectedElements[${i}] exceeds width`);
    if (Number.isFinite(el.y)&&Number.isFinite(el.height)&&el.y+el.height>100.01) e.push(`detectedElements[${i}] exceeds height`);
  });
  if (!Array.isArray(x.keylines)) e.push('keylines must be array');
  if (!Array.isArray(x.swissPrinciples)) e.push('swissPrinciples must be array');
  if (!Array.isArray(x.colorPalette) || x.colorPalette.some((c:any)=>typeof c!=='string'||!/^#[0-9A-Fa-f]{6}$/.test(c))) e.push('colorPalette invalid');
  if (typeof x.whitespaceRatio === 'string' && !/^(100(?:\.0+)?|[0-9]{1,2}(?:\.[0-9]+)?)%$/.test(x.whitespaceRatio)) e.push('whitespaceRatio invalid');
  return e.length ? {ok:false, errors:e} : {ok:true, data:x as PosterVisionAnalysis};
}

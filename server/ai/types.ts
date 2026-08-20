export const GRID_SYSTEM_TYPES = [
  'swiss_modular', '12_column', '6_column', '3_column', 'asymmetric',
  'baseline_grid', 'golden_ratio', 'rule_of_thirds', 'diagonal_isometric',
  'radial', 'freeform_organic',
] as const;
export type GridSystemType = (typeof GRID_SYSTEM_TYPES)[number];

export const ELEMENT_TYPES = ['headline','body','image','logo','accent','header','footer'] as const;
export type DetectedElementType = (typeof ELEMENT_TYPES)[number];

export interface VisionGridParams {
  columns: number; rows: number;
  marginTop: number; marginBottom: number; marginLeft: number; marginRight: number;
  columnGutter: number; rowGutter: number; baselineSpacing: number; diagonalAngle: number;
}

export interface VisionDetectedElement {
  id: string; label: string; type: DetectedElementType;
  x: number; y: number; width: number; height: number; alignmentNote: string;
}

export interface VisionKeyline {
  id: string; type: 'vertical' | 'horizontal'; position: number; label: string;
}

export interface PosterVisionAnalysis {
  systemType: GridSystemType;
  systemName: string;
  confidence: number;
  title: string;
  summary: string;
  gridParams: VisionGridParams;
  detectedElements: VisionDetectedElement[];
  keylines: VisionKeyline[];
  swissPrinciples: string[];
  typeHierarchyRating: string;
  whitespaceRatio: string;
  colorPalette: string[];
}

export interface VisionAnalysisInput {
  imageBase64: string;
  mimeType: string;
  signal?: AbortSignal;
}

export interface ProviderResult {
  data: unknown;
  provider: string;
  model: string;
  usage?: unknown;
  requestId?: string;
}

export interface VisionProvider {
  readonly name: string;
  analyzePoster(input: VisionAnalysisInput): Promise<ProviderResult>;
}

export type ResearchType =
  | 'Domain Primer'
  | 'Company Deep Dive'
  | 'Product Teardown'
  | 'Competitive Landscape';

export const RESEARCH_TYPES: ResearchType[] = [
  'Domain Primer',
  'Company Deep Dive',
  'Product Teardown',
  'Competitive Landscape',
];

export interface ResearchPiece {
  id: string;
  created_at: string;
  type: ResearchType;
  topic: string;
  date: string;
  synthesis: string;
  full_research: string;
}

export type NewResearchPiece = Omit<ResearchPiece, 'id' | 'created_at'>;

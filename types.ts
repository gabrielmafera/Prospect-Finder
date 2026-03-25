export interface Business {
  id: string;
  name: string;
  address: string;
  website?: string;
  rating?: number;
  type: string;
  mapsLink?: string;
}

export interface AuditResult {
  isOutdated: boolean;
  score: number; // 1-10, 10 being very outdated/needs replace
  summary: string;
  technologies?: string[];
  mobileFriendly?: boolean;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export type SearchState = 'idle' | 'loading' | 'success' | 'error';
export type AuditState = 'idle' | 'analyzing' | 'completed' | 'error';
export type PitchState = 'idle' | 'thinking' | 'completed' | 'error';
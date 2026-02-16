export interface Photo {
  id: string;
  url: string;
  timestamp: number;
  description?: string; // AI generated or user provided
  aiAnalysis?: string;
  isAiGenerated?: boolean;
}

export interface Location {
  id: string;
  name: string;
  x: number; // Percentage coordinate 0-100
  y: number; // Percentage coordinate 0-100
  description: string;
  photos: Photo[];
  currentStatus: 'tsubomi' | 'saki-hajime' | 'mankai' | 'chiri-hajime' | 'hazakura'; // Bloom status
}

export enum BloomStatusLabel {
  tsubomi = 'つぼみ',
  'saki-hajime' = '咲き始め',
  mankai = '満開',
  'chiri-hajime' = '散り始め',
  hazakura = '葉桜',
}

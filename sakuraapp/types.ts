export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Photo {
  id: string;
  url: string;
  timestamp: number;
  description?: string; // AI generated or user provided
  aiAnalysis?: string;
  isAiGenerated?: boolean;
  likes: string[]; // Array of user IDs who liked this photo
  userId?: string; // ID of the user who uploaded
  userName?: string; // Display name of the uploader
}

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
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
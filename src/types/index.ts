export interface MoodPost {
  id: string;
  lat: number;
  lng: number;
  mood: 'happy' | 'smile' | 'neutral' | 'sad';
  nickname: string;
  comment: string;
  timestamp: number;
}

export interface MapPosition {
  lat: number;
  lng: number;
}
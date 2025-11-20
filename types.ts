import { LatLngExpression } from 'leaflet';

export interface GeoPoint {
  lat: number;
  lng: number;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  type: 'geojson' | 'markers' | 'heatmap';
  data: any; // GeoJSON or array of points
  color?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  groundingMetadata?: any;
}

export interface AnalysisResult {
  title: string;
  summary: string;
  metrics: { label: string; value: number; unit?: string }[];
  chartData?: { name: string; value: number }[];
}

export enum MapMode {
  EXPLORE = 'EXPLORE',
  DRAW = 'DRAW',
  MEASURE = 'MEASURE'
}

export type TileProvider = 'osm' | 'satellite' | 'dark' | 'terrain';
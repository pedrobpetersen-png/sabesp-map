export interface ETA {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity_m3s: number; // metros cúbicos por segundo
  volume_treated_m3_month: number;
  municipality: string;
  system: string;
  description?: string;
}

export interface ETE {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity_m3s: number; // metros cúbicos por segundo
  treatment_pct: number; // % eficiência
  municipality: string;
  system: string;
  description?: string;
}

export interface Reservoir {
  id: string;
  name: string;
  lat: number;
  lng: number;
  total_volume_hm3: number;
  current_level_pct: number;
  history: MonthlyLevel[];
  forecast: MonthlyForecast[];
  description?: string;
}

export interface MonthlyLevel {
  month: string; // "2025-01"
  level_pct: number;
}

export interface MonthlyForecast {
  month: string;
  optimistic_pct: number;
  base_pct: number;
  pessimistic_pct: number;
}

export interface Pipeline {
  id: string;
  type: "water" | "sewage";
  name: string;
  diameter_mm: number;
  coordinates: [number, number][];
}

export interface PowerPlant {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "hydroelectric" | "self_production";
  capacity_mw: number;
  status: "operational" | "restricted" | "maintenance";
  source: "EMAE" | "SABESP";
  description: string;
}

export interface RegionData {
  id: string;
  name: string;
  municipality: string;
  water_consumption_m3: number;
  sewage_generation_m3: number;
  sewage_collection_pct: number;
  sewage_treatment_pct: number;
  population: number;
  coordinates: [number, number][][]; // polygon
}

export type LayerVisibility = {
  etas: boolean;
  etes: boolean;
  reservoirs: boolean;
  pipelines_water: boolean;
  pipelines_sewage: boolean;
  choropleth: boolean;
  power_plants: boolean;
};

export type ChoroplethMetric =
  | "water_consumption_m3"
  | "sewage_generation_m3"
  | "sewage_collection_pct"
  | "sewage_treatment_pct";

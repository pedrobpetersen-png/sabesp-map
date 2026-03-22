import { Reservoir } from "@/types";

function generateHistory(
  baseLevel: number,
  volatility: number
): { month: string; level_pct: number }[] {
  const history = [];
  let level = baseLevel;
  const startDate = new Date(2025, 2); // March 2025
  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    const monthStr = date.toISOString().slice(0, 7);
    // Seasonal pattern: rainy Oct-Mar, dry Apr-Sep
    const month = date.getMonth();
    const seasonal =
      month >= 9 || month <= 2
        ? volatility * 0.5
        : -volatility * 0.5;
    level = Math.max(5, Math.min(100, level + seasonal + (Math.random() - 0.5) * volatility));
    history.push({ month: monthStr, level_pct: Math.round(level * 10) / 10 });
  }
  return history;
}

function generateForecast(
  currentLevel: number,
  trend: number
): { month: string; optimistic_pct: number; base_pct: number; pessimistic_pct: number }[] {
  const forecast = [];
  let base = currentLevel;
  const startDate = new Date(2026, 3); // April 2026
  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    const monthStr = date.toISOString().slice(0, 7);
    const month = date.getMonth();
    const seasonal = month >= 9 || month <= 2 ? 3 : -2;
    base = Math.max(5, Math.min(100, base + trend + seasonal));
    forecast.push({
      month: monthStr,
      optimistic_pct: Math.min(100, Math.round((base + 8 + i * 0.5) * 10) / 10),
      base_pct: Math.round(base * 10) / 10,
      pessimistic_pct: Math.max(0, Math.round((base - 10 - i * 0.8) * 10) / 10),
    });
  }
  return forecast;
}

export const reservoirs: Reservoir[] = [
  {
    id: "res-001",
    name: "Sistema Cantareira",
    lat: -23.19,
    lng: -46.58,
    total_volume_hm3: 982.07,
    current_level_pct: 42.3,
    history: generateHistory(38, 6),
    forecast: generateForecast(42.3, 0.5),
  },
  {
    id: "res-002",
    name: "Sistema Alto Tietê",
    lat: -23.55,
    lng: -46.27,
    total_volume_hm3: 506.71,
    current_level_pct: 55.8,
    history: generateHistory(50, 7),
    forecast: generateForecast(55.8, 0.3),
  },
  {
    id: "res-003",
    name: "Sistema Guarapiranga",
    lat: -23.72,
    lng: -46.73,
    total_volume_hm3: 171.19,
    current_level_pct: 62.1,
    history: generateHistory(58, 8),
    forecast: generateForecast(62.1, 0.4),
  },
  {
    id: "res-004",
    name: "Sistema Rio Grande",
    lat: -23.78,
    lng: -46.53,
    total_volume_hm3: 112.8,
    current_level_pct: 78.5,
    history: generateHistory(72, 6),
    forecast: generateForecast(78.5, 0.2),
  },
  {
    id: "res-005",
    name: "Sistema Rio Claro",
    lat: -23.73,
    lng: -46.13,
    total_volume_hm3: 13.04,
    current_level_pct: 85.2,
    history: generateHistory(80, 5),
    forecast: generateForecast(85.2, 0.1),
  },
  {
    id: "res-006",
    name: "Sistema Cotia",
    lat: -23.6,
    lng: -46.92,
    total_volume_hm3: 16.49,
    current_level_pct: 58.7,
    history: generateHistory(55, 7),
    forecast: generateForecast(58.7, -0.3),
  },
  {
    id: "res-007",
    name: "Sistema São Lourenço",
    lat: -23.84,
    lng: -47.02,
    total_volume_hm3: 56.4,
    current_level_pct: 70.4,
    history: generateHistory(65, 6),
    forecast: generateForecast(70.4, 0.6),
  },
];

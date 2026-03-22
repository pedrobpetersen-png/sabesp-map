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
    description: "Maior sistema produtor de água da RMSP. Composto por 5 represas interligadas (Jaguari, Jacareí, Cachoeira, Atibainha e Paiva Castro). Abastece ~8,8 milhões de pessoas na zona norte e centro.",
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
    description: "Formado pelas represas Paraitinga, Ponte Nova, Biritiba-Mirim, Jundiaí e Taiaçupeba. Abastece ~4,5 milhões de pessoas na zona leste da RMSP.",
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
    description: "Represa Guarapiranga, segundo maior manancial da RMSP. Abastece ~4,9 milhões de pessoas na zona sul. Recebe reforço do Taquacetuba (Billings).",
  },
  {
    id: "res-004",
    name: "Represa Billings",
    lat: -23.79,
    lng: -46.58,
    total_volume_hm3: 1200.0,
    current_level_pct: 68.4,
    history: generateHistory(64, 7),
    forecast: generateForecast(68.4, 0.3),
    description: "Maior reservatório da RMSP (1,2 bilhão de m³). Adquirida pela SABESP com a compra da EMAE. Alimenta a UHE Henry Borden e o braço Rio Grande para abastecimento. Estratégica para segurança hídrica e energética.",
  },
  {
    id: "res-005",
    name: "Sistema Rio Grande",
    lat: -23.78,
    lng: -46.53,
    total_volume_hm3: 112.8,
    current_level_pct: 78.5,
    history: generateHistory(72, 6),
    forecast: generateForecast(78.5, 0.2),
    description: "Braço Rio Grande da Billings, isolado para abastecimento. Atende ~1,2 milhão de pessoas no ABC paulista via ETA Casa Grande.",
  },
  {
    id: "res-006",
    name: "Sistema Rio Claro",
    lat: -23.73,
    lng: -46.13,
    total_volume_hm3: 13.04,
    current_level_pct: 85.2,
    history: generateHistory(80, 5),
    forecast: generateForecast(85.2, 0.1),
    description: "Sistema com captação no Rio Claro, em Salesópolis. Adutora de 83 km até Santo André. Atende ~1,5 milhão de pessoas.",
  },
  {
    id: "res-007",
    name: "Sistema Cotia",
    lat: -23.6,
    lng: -46.92,
    total_volume_hm3: 16.49,
    current_level_pct: 58.7,
    history: generateHistory(55, 7),
    forecast: generateForecast(58.7, -0.3),
    description: "Formado pelas barragens Cachoeira da Graça e Pedro Beicht. Abastece municípios da zona oeste da RMSP (Cotia, Itapevi, Jandira).",
  },
  {
    id: "res-008",
    name: "Sistema São Lourenço",
    lat: -23.84,
    lng: -47.02,
    total_volume_hm3: 56.4,
    current_level_pct: 70.4,
    history: generateHistory(65, 6),
    forecast: generateForecast(70.4, 0.6),
    description: "Sistema mais novo da SABESP (inaugurado em 2018). Capta no Rio Juquiá. Abastece ~1,5 milhão de pessoas na zona sudoeste da RMSP.",
  },
];

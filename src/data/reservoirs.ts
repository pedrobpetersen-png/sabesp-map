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
  // ─── SISTEMA CANTAREIRA (4 represas interligadas) ───────────
  {
    id: "res-001",
    name: "Jaguari-Jacareí",
    lat: -22.75,
    lng: -46.05,
    total_volume_hm3: 1140,
    current_level_pct: 42.3,
    history: generateHistory(38.5, 4),
    forecast: generateForecast(42.3, 0.5),
    description: "Maior represa do Sistema Cantareira. 254 km² de área, localizada em Bragança Paulista e Joanópolis.",
  },
  {
    id: "res-002",
    name: "Cachoeira (Cantareira)",
    lat: -23.1,
    lng: -46.35,
    total_volume_hm3: 282,
    current_level_pct: 44.1,
    history: generateHistory(40.0, 4),
    forecast: generateForecast(44.1, 0.5),
    description: "Segunda represa do Sistema Cantareira. 55 km² em Mairiporã, recebe água de Jaguari-Jacareí.",
  },
  {
    id: "res-003",
    name: "Atibainha",
    lat: -23.1833,
    lng: -46.3167,
    total_volume_hm3: 134,
    current_level_pct: 45.8,
    history: generateHistory(41.5, 4),
    forecast: generateForecast(45.8, 0.5),
    description: "Terceira represa do Sistema Cantareira. 32 km² em Nazaré Paulista, recebe água da Cachoeira.",
  },
  {
    id: "res-004",
    name: "Paiva Castro",
    lat: -23.2967,
    lng: -46.5681,
    total_volume_hm3: 76,
    current_level_pct: 48.2,
    history: generateHistory(43.0, 3.5),
    forecast: generateForecast(48.2, 0.5),
    description: "Última represa do Cantareira antes da ETA Guaraú. 11,5 km² em Mairiporã.",
  },

  // ─── SISTEMA GUARAPIRANGA ───────────────────────────────────
  {
    id: "res-005",
    name: "Guarapiranga",
    lat: -23.7317,
    lng: -46.7164,
    total_volume_hm3: 194,
    current_level_pct: 61.5,
    history: generateHistory(55.0, 5),
    forecast: generateForecast(61.5, 0.3),
    description: "Represa urbana na zona sul de SP. 35,6 km², abastece 3,8 milhões de pessoas via ETA Guarapiranga.",
  },

  // ─── SISTEMA BILLINGS ──────────────────────────────────────
  {
    id: "res-006",
    name: "Billings",
    lat: -23.7817,
    lng: -46.5547,
    total_volume_hm3: 1224,
    current_level_pct: 65.2,
    history: generateHistory(60.0, 4),
    forecast: generateForecast(65.2, 0.2),
    description: "Maior reservatório da RMSP com 127 km². Multifuncional: abastecimento, energia (Henry Borden) e controle de cheias.",
  },

  // ─── SISTEMA ALTO TIETÊ (4 represas) ───────────────────────
  {
    id: "res-007",
    name: "Taiaçupeba",
    lat: -23.5547,
    lng: -45.9978,
    total_volume_hm3: 181,
    current_level_pct: 54.8,
    history: generateHistory(50.0, 5),
    forecast: generateForecast(54.8, 0.3),
    description: "Principal represa do Sistema Alto Tietê. 33 km² em Suzano, alimenta a ETA Taiaçupeba.",
  },
  {
    id: "res-008",
    name: "Biritiba-Mirim",
    lat: -23.57,
    lng: -45.92,
    total_volume_hm3: 102,
    current_level_pct: 52.3,
    history: generateHistory(48.0, 5),
    forecast: generateForecast(52.3, 0.3),
    description: "Represa do Sistema Alto Tietê. 17,4 km² em Biritiba-Mirim, interligada ao sistema Taiaçupeba.",
  },
  {
    id: "res-009",
    name: "Jundiaí (Alto Tietê)",
    lat: -23.59,
    lng: -45.83,
    total_volume_hm3: 25,
    current_level_pct: 56.1,
    history: generateHistory(51.0, 5),
    forecast: generateForecast(56.1, 0.2),
    description: "Represa do Sistema Alto Tietê. 9,3 km² em Salesópolis, na nascente do Rio Tietê.",
  },
  {
    id: "res-010",
    name: "Paraitinga",
    lat: -23.52,
    lng: -45.75,
    total_volume_hm3: 24,
    current_level_pct: 58.4,
    history: generateHistory(53.0, 5),
    forecast: generateForecast(58.4, 0.2),
    description: "Represa do Sistema Alto Tietê. 6,5 km² em Salesópolis, mais próxima da Serra do Mar.",
  },

  // ─── SISTEMA RIO GRANDE ────────────────────────────────────
  {
    id: "res-011",
    name: "Rio Grande",
    lat: -23.8153,
    lng: -46.4358,
    total_volume_hm3: 97,
    current_level_pct: 68.7,
    history: generateHistory(63.0, 4),
    forecast: generateForecast(68.7, 0.3),
    description: "Braço Rio Grande da Billings, isolado para abastecimento. 22 km² em São Bernardo do Campo.",
  },

  // ─── SISTEMA RIO CLARO ────────────────────────────────────
  {
    id: "res-012",
    name: "Cachoeira da Graça",
    lat: -23.7039,
    lng: -46.4108,
    total_volume_hm3: 50,
    current_level_pct: 62.4,
    history: generateHistory(57.0, 4),
    forecast: generateForecast(62.4, 0.2),
    description: "Represa do Sistema Rio Claro. 10 km² em Ribeirão Pires, na Serra do Mar.",
  },

  // ─── SISTEMA ALTO COTIA ───────────────────────────────────
  {
    id: "res-013",
    name: "Alto Cotia",
    lat: -23.7067,
    lng: -46.9822,
    total_volume_hm3: 38,
    current_level_pct: 55.9,
    history: generateHistory(50.0, 5),
    forecast: generateForecast(55.9, 0.2),
    description: "Represa do Sistema Alto Cotia. 8,8 km² em Cotia, um dos sistemas mais antigos da SABESP.",
  },

  // ─── SISTEMA SÃO LOURENÇO ─────────────────────────────────
  {
    id: "res-014",
    name: "Cachoeira do França",
    lat: -23.85,
    lng: -46.18,
    total_volume_hm3: 304,
    current_level_pct: 71.3,
    history: generateHistory(66.0, 3),
    forecast: generateForecast(71.3, 0.3),
    description: "Represa do Sistema São Lourenço. 48 km² em Ibiúna, sistema mais novo da RMSP (2018).",
  },

  // ─── SISTEMA CUBATÃO ──────────────────────────────────────
  {
    id: "res-015",
    name: "Represa Cubatão",
    lat: -23.879,
    lng: -46.425,
    total_volume_hm3: 40,
    current_level_pct: 59.1,
    history: generateHistory(54.0, 4),
    forecast: generateForecast(59.1, 0.2),
    description: "Represa do Sistema Cubatão na Baixada Santista. 9 km², alimenta a ETA Cubatão/Henry Borden.",
  },
];

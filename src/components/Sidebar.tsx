"use client";

import { LayerVisibility, ChoroplethMetric } from "@/types";
import { etas } from "@/data/etas";
import { etes } from "@/data/etes";
import { reservoirs } from "@/data/reservoirs";
import { powerPlants } from "@/data/powerplants";
import { regions } from "@/data/regions";

interface SidebarProps {
  layers: LayerVisibility;
  onToggleLayer: (key: keyof LayerVisibility) => void;
  choroplethMetric: ChoroplethMetric;
  onChoroplethMetricChange: (metric: ChoroplethMetric) => void;
  is3D: boolean;
  onToggle3D: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

// SVG icon components for legend differentiation
function IconDroplet({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1.5C8 1.5 3 7 3 10a5 5 0 0010 0c0-3-5-8.5-5-8.5zM8 13.5a3.5 3.5 0 01-3.5-3.5c0-.5.1-.9.3-1.4L8 5.5l3.2 3.1c.2.5.3.9.3 1.4A3.5 3.5 0 018 13.5z" />
    </svg>
  );
}

function IconSewage({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 4h12v2H2zM4 7h8v1.5c0 2.5-1.8 4.5-4 4.5s-4-2-4-4.5V7zm2 1.5v.5c0 1.4.9 2.5 2 2.5s2-1.1 2-2.5v-.5H6z" />
      <circle cx="5" cy="2.5" r="1" />
      <circle cx="8" cy="2" r="1" />
      <circle cx="11" cy="2.5" r="1" />
    </svg>
  );
}

function IconReservoir({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 10c1.5-1 3-1.5 4.5-.5s3 1 4.5 0 3-.5 4.5.5v3H1v-3z" opacity="0.4" />
      <path d="M1 8c1.5-1 3-1.5 4.5-.5s3 1 4.5 0 3-.5 4.5.5v3c-1.5-1-3-1.5-4.5-.5s-3 1-4.5 0S2.5 9 1 10V8z" />
      <path d="M3 4l2-2h6l2 2v3H3V4z" opacity="0.3" />
    </svg>
  );
}

function IconBolt({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="currentColor">
      <path d="M9 1L4 9h4l-1 6 5-8H8l1-6z" />
    </svg>
  );
}

function IconPipe({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="6" width="14" height="4" rx="2" />
      <rect x="3" y="4" width="3" height="8" rx="1" opacity="0.4" />
      <rect x="10" y="4" width="3" height="8" rx="1" opacity="0.4" />
    </svg>
  );
}

function IconRegion({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1l6 4v6l-6 4-6-4V5l6-4zm0 2L4 5.5v5L8 13l4-2.5v-5L8 3z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

const layerConfig: {
  key: keyof LayerVisibility;
  label: string;
  colorClass: string;
  colorHex: string;
  Icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
}[] = [
  { key: "etas", label: "ETAs - Tratamento de Água", colorClass: "bg-[#005BAA]", colorHex: "#005BAA", Icon: IconDroplet },
  { key: "etes", label: "ETEs - Tratamento de Esgoto", colorClass: "bg-[#D97706]", colorHex: "#D97706", Icon: IconSewage },
  { key: "reservoirs", label: "Reservatórios", colorClass: "bg-[#00A651]", colorHex: "#00A651", Icon: IconReservoir },
  { key: "pipelines_water", label: "Adutoras (Água)", colorClass: "bg-[#4A90D9]", colorHex: "#4A90D9", Icon: IconPipe },
  { key: "pipelines_sewage", label: "Coletores (Esgoto)", colorClass: "bg-[#8B5CF6]", colorHex: "#8B5CF6", Icon: IconPipe },
  { key: "power_plants", label: "Geração de Energia", colorClass: "bg-[#F59E0B]", colorHex: "#F59E0B", Icon: IconBolt },
  { key: "choropleth", label: "Regiões (Dados)", colorClass: "bg-[#00A651]", colorHex: "#00A651", Icon: IconRegion },
];

const metricOptions: { value: ChoroplethMetric; label: string }[] = [
  { value: "water_consumption_m3", label: "Consumo de Água (m³/mês)" },
  { value: "sewage_generation_m3", label: "Geração de Esgoto (m³/mês)" },
  { value: "sewage_collection_pct", label: "% Coleta de Esgoto" },
  { value: "sewage_treatment_pct", label: "% Tratamento de Esgoto" },
];

export default function Sidebar({
  layers,
  onToggleLayer,
  choroplethMetric,
  onChoroplethMetricChange,
  is3D,
  onToggle3D,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  const totalCapacityETA = etas.reduce((s, e) => s + e.capacity_m3s, 0);
  const totalCapacityETE = etes.reduce((s, e) => s + e.capacity_m3s, 0);
  const totalEnergyMW = powerPlants.reduce((s, p) => s + p.capacity_mw, 0);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: "#005BAA" }}>
          S
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#005BAA] leading-tight">SABESP</h1>
          <p className="text-[10px] text-gray-500 leading-tight">Mapa do Saneamento - Estado de São Paulo</p>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar ETA, ETE, usina, município..."
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#005BAA] focus:ring-1 focus:ring-[#005BAA]/20 transition-colors"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#005BAA]/5 border border-[#005BAA]/15 rounded-lg p-2 flex items-center gap-2">
          <IconDroplet className="w-5 h-5 text-[#005BAA] shrink-0" />
          <div>
            <div className="text-lg font-bold text-[#005BAA] leading-none">{etas.length}</div>
            <div className="text-[10px] text-gray-500">ETAs</div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-2 flex items-center gap-2">
          <IconSewage className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            <div className="text-lg font-bold text-amber-700 leading-none">{etes.length}</div>
            <div className="text-[10px] text-gray-500">ETEs</div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200/50 rounded-lg p-2 flex items-center gap-2">
          <IconReservoir className="w-5 h-5 text-[#00A651] shrink-0" />
          <div>
            <div className="text-lg font-bold text-[#00A651] leading-none">{reservoirs.length}</div>
            <div className="text-[10px] text-gray-500">Reservatórios</div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200/50 rounded-lg p-2 flex items-center gap-2">
          <IconBolt className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <div className="text-lg font-bold text-amber-600 leading-none">{powerPlants.length}</div>
            <div className="text-[10px] text-gray-500">Usinas</div>
          </div>
        </div>
      </div>

      {/* Capacity KPIs */}
      <div className="bg-gray-50 rounded-lg p-2.5 text-xs space-y-1.5 border border-gray-200">
        <div className="flex justify-between">
          <span className="text-gray-500">Cap. tratamento água</span>
          <span className="font-bold text-[#005BAA]">{totalCapacityETA.toFixed(1)} m³/s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Cap. tratamento esgoto</span>
          <span className="font-bold text-amber-700">{totalCapacityETE.toFixed(1)} m³/s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Potência instalada</span>
          <span className="font-bold text-amber-600">{totalEnergyMW.toFixed(0)} MW</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Regiões atendidas</span>
          <span className="font-bold text-[#00A651]">{regions.length}</span>
        </div>
      </div>

      {/* 3D Toggle */}
      <button
        onClick={onToggle3D}
        className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
          is3D
            ? "bg-[#005BAA] border-[#005BAA] text-white shadow-md"
            : "bg-white border-gray-300 text-gray-600 hover:border-[#005BAA] hover:text-[#005BAA]"
        }`}
      >
        {is3D ? "Modo 3D Ativo (com edificações)" : "Ativar Modo 3D"}
      </button>

      {/* Layer Controls with Icons */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Camadas</h2>
        <div className="flex flex-col gap-0.5">
          {layerConfig.map(({ key, label, colorClass, colorHex, Icon }) => (
            <label
              key={key}
              className="flex items-center gap-2 cursor-pointer group py-1 px-1 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={layers[key]}
                  onChange={() => onToggleLayer(key)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    layers[key]
                      ? `${colorClass} border-transparent`
                      : "bg-white border-gray-300 group-hover:border-gray-400"
                  }`}
                >
                  {layers[key] && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <Icon className="w-4 h-4 shrink-0" style={{ color: layers[key] ? colorHex : "#9CA3AF" }} />
              <span className={`text-xs transition-colors ${layers[key] ? "text-gray-800" : "text-gray-400"}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Choropleth Metric Selector */}
      {layers.choropleth && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Métrica Regional</h2>
          <select
            value={choroplethMetric}
            onChange={(e) => onChoroplethMetricChange(e.target.value as ChoroplethMetric)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-[#005BAA]"
          >
            {metricOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Legend with distinct icons */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Legenda</h2>
        <div className="flex flex-col gap-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <IconDroplet className="w-4 h-4 text-[#005BAA] shrink-0" />
            <span className="text-gray-600">ETA - Tratamento de Água</span>
          </div>
          <div className="flex items-center gap-2">
            <IconSewage className="w-4 h-4 text-[#D97706] shrink-0" />
            <span className="text-gray-600">ETE - Tratamento de Esgoto</span>
          </div>
          <div className="flex items-center gap-2">
            <IconReservoir className="w-4 h-4 text-[#00A651] shrink-0" />
            <span className="text-gray-600">{'Reservatório > 60%'}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconReservoir className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-gray-600">{'Reservatório 30-60%'}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconReservoir className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-gray-600">{'Reservatório < 30% (crítico)'}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconBolt className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <span className="text-gray-600">Usina Hidrelétrica (EMAE)</span>
          </div>
          <div className="flex items-center gap-2">
            <IconBolt className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-gray-600">Geração Energia (Biogás/PCH)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#005BAA] rounded shrink-0" />
            <span className="text-gray-600">Adutoras de água</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 shrink-0 border-t-2 border-dashed border-[#8B5CF6]" />
            <span className="text-gray-600">Coletores de esgoto</span>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mt-auto pt-3 border-t border-gray-200">
        <p className="text-[10px] text-gray-400">Fontes: SABESP, EMAE, ANA, SNIS, INMET/CPTEC</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Dados ilustrativos para treinamento e demonstração</p>
      </div>
    </div>
  );
}

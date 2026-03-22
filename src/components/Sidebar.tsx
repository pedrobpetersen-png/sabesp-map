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

const layerConfig: {
  key: keyof LayerVisibility;
  label: string;
  colorClass: string;
  colorHex: string;
}[] = [
  { key: "etas", label: "ETAs (Tratamento de Água)", colorClass: "bg-[#005BAA]", colorHex: "#005BAA" },
  { key: "etes", label: "ETEs (Tratamento de Esgoto)", colorClass: "bg-[#D97706]", colorHex: "#D97706" },
  { key: "reservoirs", label: "Reservatórios", colorClass: "bg-[#00A651]", colorHex: "#00A651" },
  { key: "pipelines_water", label: "Adutoras (Água)", colorClass: "bg-[#4A90D9]", colorHex: "#4A90D9" },
  { key: "pipelines_sewage", label: "Coletores (Esgoto)", colorClass: "bg-[#8B5CF6]", colorHex: "#8B5CF6" },
  { key: "power_plants", label: "Usinas de Energia", colorClass: "bg-[#F59E0B]", colorHex: "#F59E0B" },
  { key: "choropleth", label: "Regiões (Dados)", colorClass: "bg-[#00A651]", colorHex: "#00A651" },
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
  // KPIs
  const totalCapacityETA = etas.reduce((s, e) => s + e.capacity_m3s, 0);
  const totalCapacityETE = etes.reduce((s, e) => s + e.capacity_m3s, 0);
  const totalEnergyMW = powerPlants.reduce((s, p) => s + p.capacity_mw, 0);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: "#005BAA" }}
        >
          S
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#005BAA] leading-tight">
            SABESP
          </h1>
          <p className="text-[10px] text-gray-500 leading-tight">
            Mapa do Saneamento - Estado de São Paulo
          </p>
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
        <div className="bg-[#005BAA]/5 border border-[#005BAA]/15 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-[#005BAA]">{etas.length}</div>
          <div className="text-[10px] text-gray-500">ETAs</div>
        </div>
        <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-amber-700">{etes.length}</div>
          <div className="text-[10px] text-gray-500">ETEs</div>
        </div>
        <div className="bg-green-50 border border-green-200/50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-[#00A651]">{reservoirs.length}</div>
          <div className="text-[10px] text-gray-500">Reservatórios</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200/50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-amber-600">{powerPlants.length}</div>
          <div className="text-[10px] text-gray-500">Usinas</div>
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

      {/* Layer Controls */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Camadas</h2>
        <div className="flex flex-col gap-1">
          {layerConfig.map(({ key, label, colorClass }) => (
            <label
              key={key}
              className="flex items-center gap-2.5 cursor-pointer group py-0.5"
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
              <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Choropleth Metric Selector */}
      {layers.choropleth && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Métrica Regional
          </h2>
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

      {/* Legend */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Legenda</h2>
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#005BAA]" />
            <span className="text-gray-600">ETA - Estação de Trat. de Água</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#D97706]" />
            <span className="text-gray-600">ETE - Estação de Trat. de Esgoto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00A651]" />
            <span className="text-gray-600">{'Reservatório > 60%'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-gray-600">{'Reservatório 30-60%'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600">{'Reservatório < 30%'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <span className="text-gray-600">Usina Hidrelétrica (EMAE)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Autoprodução (Biogás/PCH)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#005BAA] rounded" />
            <span className="text-gray-600">Adutoras de água</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#8B5CF6] rounded" style={{ borderTop: "1px dashed #8B5CF6" }} />
            <span className="text-gray-600">Coletores de esgoto</span>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mt-auto pt-3 border-t border-gray-200">
        <p className="text-[10px] text-gray-400">
          Fontes: SABESP, EMAE, ANA, SNIS, INMET/CPTEC
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Dados ilustrativos para treinamento e demonstração
        </p>
      </div>
    </div>
  );
}

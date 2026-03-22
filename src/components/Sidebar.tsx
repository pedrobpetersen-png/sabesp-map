"use client";

import { LayerVisibility, ChoroplethMetric } from "@/types";

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
  color: string;
}[] = [
  { key: "etas", label: "ETAs (Água)", color: "bg-blue-500" },
  { key: "etes", label: "ETEs (Esgoto)", color: "bg-orange-500" },
  { key: "reservoirs", label: "Reservatórios", color: "bg-cyan-500" },
  { key: "pipelines_water", label: "Adutoras (Água)", color: "bg-blue-400" },
  { key: "pipelines_sewage", label: "Coletores (Esgoto)", color: "bg-purple-500" },
  { key: "choropleth", label: "Regiões (Consumo)", color: "bg-green-500" },
];

const metricOptions: { value: ChoroplethMetric; label: string }[] = [
  { value: "water_consumption_m3", label: "Consumo de Água" },
  { value: "sewage_generation_m3", label: "Geração de Esgoto" },
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
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white leading-tight">
          SABESP
        </h1>
        <p className="text-xs text-slate-400">
          Mapa do Saneamento - Estado de São Paulo
        </p>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar ETA, ETE, município..."
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* 3D Toggle */}
      <button
        onClick={onToggle3D}
        className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors border ${
          is3D
            ? "bg-cyan-600/30 border-cyan-500 text-cyan-300"
            : "bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500"
        }`}
      >
        {is3D ? "Modo 3D Ativo" : "Ativar Modo 3D"}
      </button>

      {/* Layer Controls */}
      <div>
        <h2 className="text-sm font-semibold text-slate-300 mb-2">Camadas</h2>
        <div className="flex flex-col gap-1.5">
          {layerConfig.map(({ key, label, color }) => (
            <label
              key={key}
              className="flex items-center gap-2.5 cursor-pointer group"
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
                      ? `${color} border-transparent`
                      : "bg-slate-800 border-slate-600 group-hover:border-slate-500"
                  }`}
                >
                  {layers[key] && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Choropleth Metric Selector */}
      {layers.choropleth && (
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-2">
            Métrica Regional
          </h2>
          <select
            value={choroplethMetric}
            onChange={(e) =>
              onChoroplethMetricChange(e.target.value as ChoroplethMetric)
            }
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            {metricOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Legend */}
      <div>
        <h2 className="text-sm font-semibold text-slate-300 mb-2">Legenda</h2>
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-400">ETAs - Estações de Tratamento de Água</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-slate-400">ETEs - Estações de Tratamento de Esgoto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-400">Reservatório {'>'} 60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-slate-400">Reservatório 30-60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-400">Reservatório {'<'} 30%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-0.5 bg-blue-400 rounded" />
            <span className="text-slate-400">Adutoras de água</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-0.5 bg-purple-500 rounded border-dashed" />
            <span className="text-slate-400">Coletores de esgoto</span>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mt-auto pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Fontes: SABESP, ANA, SNIS, INMET
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Dados ilustrativos para demonstração
        </p>
      </div>
    </div>
  );
}

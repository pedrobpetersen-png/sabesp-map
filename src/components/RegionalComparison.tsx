"use client";

import { useState } from "react";
import { regions } from "@/data/regions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RegionalComparisonProps {
  viewMode: "investor" | "engineer";
}

type ComparisonMetric =
  | "sewage_collection_pct"
  | "sewage_treatment_pct"
  | "water_consumption_m3"
  | "population";

const metricConfig: Record<
  ComparisonMetric,
  { label: string; unit: string; color: string; format: (v: number) => string }
> = {
  sewage_collection_pct: {
    label: "Coleta de Esgoto (%)",
    unit: "%",
    color: "#D97706",
    format: (v) => v.toFixed(0) + "%",
  },
  sewage_treatment_pct: {
    label: "Tratamento de Esgoto (%)",
    unit: "%",
    color: "#00A651",
    format: (v) => v.toFixed(0) + "%",
  },
  water_consumption_m3: {
    label: "Consumo de Água (M m³/mês)",
    unit: "M m³",
    color: "#005BAA",
    format: (v) => (v / 1_000_000).toFixed(1) + "M",
  },
  population: {
    label: "População",
    unit: "",
    color: "#8B5CF6",
    format: (v) => (v / 1_000_000).toFixed(1) + "M",
  },
};

function getSemaphoreColor(collection: number, treatment: number): string {
  if (collection >= 90 && treatment >= 80) return "#00A651"; // green
  if (collection >= 70 && treatment >= 60) return "#F59E0B"; // amber
  return "#EF4444"; // red
}

export default function RegionalComparison({ viewMode }: RegionalComparisonProps) {
  const [metric, setMetric] = useState<ComparisonMetric>("sewage_treatment_pct");
  const config = metricConfig[metric];

  const chartData = [...regions]
    .sort((a, b) => (b[metric] as number) - (a[metric] as number))
    .map((r) => ({
      name: r.name.length > 18 ? r.name.slice(0, 16) + "…" : r.name,
      fullName: r.name,
      value: r[metric] as number,
      collection: r.sewage_collection_pct,
      treatment: r.sewage_treatment_pct,
    }));

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-base font-bold text-[#005BAA] mb-1">
        Comparativo Regional
      </h2>
      <p className="text-[10px] text-gray-400 mb-3">
        Compare indicadores entre as regiões atendidas pela SABESP
      </p>

      {/* Metric selector */}
      <select
        value={metric}
        onChange={(e) => setMetric(e.target.value as ComparisonMetric)}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-[#005BAA] mb-3"
      >
        {Object.entries(metricConfig).map(([key, cfg]) => (
          <option key={key} value={key}>
            {cfg.label}
          </option>
        ))}
      </select>

      {/* Semaphore Cards */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {regions.map((r) => {
          const semColor = getSemaphoreColor(
            r.sewage_collection_pct,
            r.sewage_treatment_pct
          );
          return (
            <div
              key={r.id}
              className="bg-white rounded-lg p-2.5 border border-gray-200 shadow-sm"
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-[10px] font-medium text-gray-700 leading-tight flex-1 mr-1">
                  {r.name}
                </span>
                <div
                  className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                  style={{ backgroundColor: semColor }}
                  title={`Coleta: ${r.sewage_collection_pct}% | Trat: ${r.sewage_treatment_pct}%`}
                />
              </div>
              <div className="text-[9px] text-gray-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Coleta</span>
                  <span className="font-medium text-gray-600">{r.sewage_collection_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tratamento</span>
                  <span className="font-medium text-gray-600">{r.sewage_treatment_pct}%</span>
                </div>
                {viewMode === "engineer" && (
                  <div className="flex justify-between">
                    <span>Pop.</span>
                    <span className="font-medium text-gray-600">
                      {(r.population / 1000).toFixed(0)}k
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{config.label}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10 }}
              stroke="#94A3B8"
              domain={metric.includes("pct") ? [0, 100] : undefined}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 9 }}
              stroke="#94A3B8"
              width={100}
            />
            <Tooltip
              formatter={(value) => [config.format(Number(value)), config.label]}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                fontSize: 11,
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    metric.includes("pct")
                      ? entry.value >= 80
                        ? "#00A651"
                        : entry.value >= 60
                        ? "#F59E0B"
                        : "#EF4444"
                      : config.color
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-600 mb-1.5">Semáforo de Saneamento</h3>
        <div className="flex gap-4 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00A651]" />
            <span className="text-gray-500">Adequado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="text-gray-500">Atenção</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="text-gray-500">Crítico</span>
          </div>
        </div>
        <p className="text-[9px] text-gray-400 mt-1.5">
          Verde: coleta {">"}90% e tratamento {">"}80% | Amarelo: coleta {">"}70% e tratamento {">"}60% | Vermelho: abaixo
        </p>
      </div>

      {/* Data sources */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-[9px] text-gray-400">
          Fontes: SNIS, ANA, SABESP Relatório Anual. Dados ilustrativos para demonstração.
        </p>
      </div>
    </div>
  );
}

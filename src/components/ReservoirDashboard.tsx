"use client";

import { reservoirs } from "@/data/reservoirs";
import { getLevelColor } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";

interface ReservoirDashboardProps {
  selectedId: string | null;
  onClose: () => void;
}

export default function ReservoirDashboard({
  selectedId,
  onClose,
}: ReservoirDashboardProps) {
  const reservoir = selectedId
    ? reservoirs.find((r) => r.id === selectedId)
    : null;

  if (!reservoir) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-lg font-bold text-cyan-400 mb-4">
          Reservatórios - Visão Geral
        </h2>
        <div className="grid grid-cols-1 gap-3 overflow-y-auto flex-1 pr-1">
          {reservoirs.map((r) => (
            <button
              key={r.id}
              className="bg-slate-800/80 rounded-lg p-3 text-left hover:bg-slate-700/80 transition-colors border border-slate-700"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-slate-200">
                  {r.name}
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ color: getLevelColor(r.current_level_pct) }}
                >
                  {r.current_level_pct}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all"
                  style={{
                    width: `${r.current_level_pct}%`,
                    backgroundColor: getLevelColor(r.current_level_pct),
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-slate-400">
                <span>{r.total_volume_hm3} hm³ total</span>
                <span>
                  {(
                    (r.total_volume_hm3 * r.current_level_pct) /
                    100
                  ).toFixed(1)}{" "}
                  hm³ atual
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const historyData = reservoir.history.map((h) => ({
    month: h.month.slice(5),
    nivel: h.level_pct,
  }));

  const forecastData = reservoir.forecast.map((f) => ({
    month: f.month.slice(5),
    otimista: f.optimistic_pct,
    base: f.base_pct,
    pessimista: f.pessimistic_pct,
  }));

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-cyan-400">{reservoir.name}</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-slate-700"
        >
          Voltar
        </button>
      </div>

      {/* Current Level */}
      <div className="bg-slate-800/80 rounded-lg p-4 mb-4 border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300">Nível Atual</span>
          <span
            className="text-3xl font-bold"
            style={{ color: getLevelColor(reservoir.current_level_pct) }}
          >
            {reservoir.current_level_pct}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div
            className="h-4 rounded-full transition-all"
            style={{
              width: `${reservoir.current_level_pct}%`,
              backgroundColor: getLevelColor(reservoir.current_level_pct),
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Volume total: {reservoir.total_volume_hm3} hm³</span>
          <span>
            Armazenado:{" "}
            {(
              (reservoir.total_volume_hm3 * reservoir.current_level_pct) /
              100
            ).toFixed(1)}{" "}
            hm³
          </span>
        </div>
      </div>

      {/* History Chart */}
      <div className="bg-slate-800/80 rounded-lg p-4 mb-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">
          Histórico (12 meses)
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              tick={{ fontSize: 10 }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#94a3b8"
              tick={{ fontSize: 10 }}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
            />
            <Line
              type="monotone"
              dataKey="nivel"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={{ fill: "#22d3ee", r: 3 }}
              name="Nível %"
            />
            <ReferenceLine
              y={30}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{
                value: "Crítico",
                fill: "#ef4444",
                fontSize: 10,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Chart */}
      <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">
          Previsão (próximos 12 meses)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              tick={{ fontSize: 10 }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#94a3b8"
              tick={{ fontSize: 10 }}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="otimista"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.1}
              strokeWidth={1.5}
              name="Otimista"
              strokeDasharray="4 2"
            />
            <Area
              type="monotone"
              dataKey="base"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.15}
              strokeWidth={2}
              name="Base"
            />
            <Area
              type="monotone"
              dataKey="pessimista"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.1}
              strokeWidth={1.5}
              name="Pessimista"
              strokeDasharray="4 2"
            />
            <ReferenceLine
              y={30}
              stroke="#ef4444"
              strokeDasharray="3 3"
            />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-500 mt-2">
          Cenários baseados em tendência de consumo e projeções pluviométricas
          (INMET/CPTEC)
        </p>
      </div>
    </div>
  );
}

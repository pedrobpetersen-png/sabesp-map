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
  onSelect: (id: string) => void;
  onClose: () => void;
  viewMode: "investor" | "engineer";
}

export default function ReservoirDashboard({
  selectedId,
  onSelect,
  onClose,
  viewMode,
}: ReservoirDashboardProps) {
  const reservoir = selectedId
    ? reservoirs.find((r) => r.id === selectedId)
    : null;

  if (!reservoir) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-base font-bold text-[#005BAA] mb-3">
          Reservatórios - Visão Geral
        </h2>
        <p className="text-[10px] text-gray-400 mb-3">Clique em um reservatório para ver detalhes e navegar no mapa</p>
        <div className="grid grid-cols-1 gap-2.5 overflow-y-auto flex-1 pr-1">
          {reservoirs.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md hover:border-[#005BAA]/30 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-gray-800 group-hover:text-[#005BAA] transition-colors">
                  {r.name}
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ color: getLevelColor(r.current_level_pct) }}
                >
                  {r.current_level_pct}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all"
                  style={{
                    width: `${r.current_level_pct}%`,
                    backgroundColor: getLevelColor(r.current_level_pct),
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
                <span>{r.total_volume_hm3} hm³ total</span>
                <span>
                  {((r.total_volume_hm3 * r.current_level_pct) / 100).toFixed(1)} hm³ armazenado
                </span>
              </div>
              {r.description && (
                <p className="text-[10px] text-gray-400 mt-1 leading-snug line-clamp-2">
                  {r.description}
                </p>
              )}
              <div className="text-[10px] text-[#005BAA] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                Clique para ver no mapa e detalhes
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
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-[#005BAA]">{reservoir.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-[#005BAA] text-xs px-2 py-1 rounded hover:bg-[#005BAA]/5 transition-colors"
        >
          Voltar
        </button>
      </div>

      {/* Description */}
      {reservoir.description && (
        <p className="text-xs text-gray-500 mb-3 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          {reservoir.description}
        </p>
      )}

      {/* Current Level */}
      <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm">Nível Atual</span>
          <span
            className="text-3xl font-bold"
            style={{ color: getLevelColor(reservoir.current_level_pct) }}
          >
            {reservoir.current_level_pct}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="h-4 rounded-full transition-all"
            style={{
              width: `${reservoir.current_level_pct}%`,
              backgroundColor: getLevelColor(reservoir.current_level_pct),
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Volume total: {reservoir.total_volume_hm3} hm³</span>
          <span>
            Armazenado:{" "}
            {((reservoir.total_volume_hm3 * reservoir.current_level_pct) / 100).toFixed(1)} hm³
          </span>
        </div>
      </div>

      {/* History Chart */}
      <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Histórico (12 meses)
        </h3>
        <ResponsiveContainer width="100%" height={170}>
          <LineChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} stroke="#94A3B8" tick={{ fontSize: 10 }} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                color: "#334155",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="nivel"
              stroke="#005BAA"
              strokeWidth={2}
              dot={{ fill: "#005BAA", r: 3 }}
              name="Nível %"
            />
            <ReferenceLine
              y={30}
              stroke="#EF4444"
              strokeDasharray="3 3"
              label={{ value: "Crítico", fill: "#EF4444", fontSize: 10 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Previsão (próximos 12 meses)
        </h3>
        <ResponsiveContainer width="100%" height={190}>
          <AreaChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} stroke="#94A3B8" tick={{ fontSize: 10 }} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                color: "#334155",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="otimista" stroke="#00A651" fill="#00A651" fillOpacity={0.08} strokeWidth={1.5} name="Otimista" strokeDasharray="4 2" />
            <Area type="monotone" dataKey="base" stroke="#005BAA" fill="#005BAA" fillOpacity={0.12} strokeWidth={2} name="Base" />
            <Area type="monotone" dataKey="pessimista" stroke="#EF4444" fill="#EF4444" fillOpacity={0.08} strokeWidth={1.5} name="Pessimista" strokeDasharray="4 2" />
            <ReferenceLine y={30} stroke="#EF4444" strokeDasharray="3 3" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-gray-400 mt-2">
          Cenários baseados em tendência de consumo e projeções pluviométricas (INMET/CPTEC)
        </p>
      </div>
    </div>
  );
}

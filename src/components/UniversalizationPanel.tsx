"use client";

import { regions } from "@/data/regions";
import { etas } from "@/data/etas";
import { etes } from "@/data/etes";

interface UniversalizationPanelProps {
  viewMode: "investor" | "engineer";
}

// Marco Legal do Saneamento (Lei 14.026/2020) targets for 2033
const TARGETS = {
  water_supply_pct: 99, // 99% cobertura de água
  sewage_collection_pct: 90, // 90% coleta de esgoto
  sewage_treatment_pct: 90, // 90% tratamento do esgoto coletado
  water_loss_pct: 25, // máximo 25% de perdas
};

function ProgressBar({
  label,
  current,
  target,
  color,
  tooltip,
}: {
  label: string;
  current: number;
  target: number;
  color: string;
  tooltip?: string;
}) {
  const gap = target - current;
  const isOnTrack = gap <= 10;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-700">{label}</span>
          {tooltip && (
            <span className="text-[9px] text-gray-400 cursor-help" title={tooltip}>
              ?
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color }}>
            {current.toFixed(1)}%
          </span>
          <span className="text-[10px] text-gray-400">/ {target}%</span>
        </div>
      </div>
      <div className="relative w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all"
          style={{ width: `${Math.min(100, (current / target) * 100)}%`, backgroundColor: color }}
        />
        {/* Target marker */}
        <div
          className="absolute top-0 h-3 w-0.5 bg-gray-600"
          style={{ left: `${Math.min(100, target)}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span
          className={`text-[10px] font-medium ${
            isOnTrack ? "text-green-600" : "text-amber-600"
          }`}
        >
          {isOnTrack ? "No caminho" : `Faltam ${gap.toFixed(1)} p.p.`}
        </span>
        <span className="text-[10px] text-gray-400">Meta 2033</span>
      </div>
    </div>
  );
}

export default function UniversalizationPanel({ viewMode }: UniversalizationPanelProps) {
  const totalPopulation = regions.reduce((s, r) => s + r.population, 0);

  const avgCollection =
    regions.reduce((s, r) => s + r.sewage_collection_pct * r.population, 0) / totalPopulation;
  const avgTreatment =
    regions.reduce((s, r) => s + r.sewage_treatment_pct * r.population, 0) / totalPopulation;

  // Simulated water supply coverage (high for SP)
  const avgWaterSupply = 95.2;
  // Simulated water loss
  const currentWaterLoss = 31.8;

  const totalCapacityETA = etas.reduce((s, e) => s + e.capacity_m3s, 0);
  const totalCapacityETE = etes.reduce((s, e) => s + e.capacity_m3s, 0);

  // Gap ranking: regions sorted by lowest treatment %
  const gapRanking = [...regions].sort(
    (a, b) => a.sewage_treatment_pct - b.sewage_treatment_pct
  );

  // Investment estimates (illustrative)
  const estimatedInvestmentBRL = 48.5; // bilhões
  const investedSoFar = 18.2; // bilhões

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-base font-bold text-[#00A651] mb-1">
        Universalização do Saneamento
      </h2>
      <p className="text-[10px] text-gray-400 mb-4">
        Marco Legal (Lei 14.026/2020) - Metas até 2033
      </p>

      {/* Progress Bars */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Progresso das Metas</h3>

        <ProgressBar
          label="Cobertura de Água"
          current={avgWaterSupply}
          target={TARGETS.water_supply_pct}
          color="#005BAA"
          tooltip="% da população com acesso à rede de água tratada"
        />
        <ProgressBar
          label="Coleta de Esgoto"
          current={avgCollection}
          target={TARGETS.sewage_collection_pct}
          color="#D97706"
          tooltip="% do esgoto gerado que é coletado pela rede"
        />
        <ProgressBar
          label="Tratamento de Esgoto"
          current={avgTreatment}
          target={TARGETS.sewage_treatment_pct}
          color="#00A651"
          tooltip="% do esgoto coletado que recebe tratamento adequado"
        />
        <ProgressBar
          label={`Perdas de Água (máx ${TARGETS.water_loss_pct}%)`}
          current={100 - currentWaterLoss}
          target={100 - TARGETS.water_loss_pct}
          color="#8B5CF6"
          tooltip="Inverso do índice de perdas na distribuição"
        />
      </div>

      {/* Investment Summary (Investor mode shows more detail) */}
      {viewMode === "investor" && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Investimentos Necessários</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Investimento total estimado</span>
              <span className="font-bold text-[#005BAA]">R$ {estimatedInvestmentBRL} bi</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Já investido (acumulado)</span>
              <span className="font-bold text-[#00A651]">R$ {investedSoFar} bi</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div
                className="h-2.5 rounded-full bg-[#00A651]"
                style={{ width: `${(investedSoFar / estimatedInvestmentBRL) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>{((investedSoFar / estimatedInvestmentBRL) * 100).toFixed(0)}% executado</span>
              <span>R$ {(estimatedInvestmentBRL - investedSoFar).toFixed(1)} bi restante</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-100 pt-2">
            Projeção de retorno: privatização SABESP (2024) trouxe R$ 6,9 bi ao Estado. Modelo regulatório ARSESP garante revisão tarifária quinquenal.
          </p>
        </div>
      )}

      {/* Capacity Summary */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Capacidade Instalada</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-[#005BAA]/5 rounded-lg">
            <div className="text-lg font-bold text-[#005BAA]">{totalCapacityETA.toFixed(1)}</div>
            <div className="text-[10px] text-gray-500">m³/s trat. água</div>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg">
            <div className="text-lg font-bold text-amber-700">{totalCapacityETE.toFixed(1)}</div>
            <div className="text-[10px] text-gray-500">m³/s trat. esgoto</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-[#00A651]">{(totalPopulation / 1_000_000).toFixed(1)}</div>
            <div className="text-[10px] text-gray-500">mi hab. atendidos</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{regions.length}</div>
            <div className="text-[10px] text-gray-500">regiões operacionais</div>
          </div>
        </div>
      </div>

      {/* Gap Ranking */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Ranking de Defasagem
        </h3>
        <p className="text-[10px] text-gray-400 mb-2">
          Regiões com menor tratamento de esgoto (prioridade de investimento)
        </p>
        <div className="space-y-2">
          {gapRanking.slice(0, 5).map((r, i) => {
            const gap = TARGETS.sewage_treatment_pct - r.sewage_treatment_pct;
            return (
              <div
                key={r.id}
                className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0"
              >
                <span
                  className={`text-xs font-bold w-5 text-center ${
                    i === 0 ? "text-red-500" : i < 3 ? "text-amber-500" : "text-gray-400"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 truncate">{r.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${r.sewage_treatment_pct}%`,
                          backgroundColor:
                            r.sewage_treatment_pct >= 80
                              ? "#00A651"
                              : r.sewage_treatment_pct >= 60
                              ? "#F59E0B"
                              : "#EF4444",
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 min-w-[28px] text-right">
                      {r.sewage_treatment_pct}%
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-red-500 font-medium min-w-[40px] text-right">
                  -{gap.toFixed(0)} p.p.
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data sources */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-[9px] text-gray-400">
          Fonte: SNIS 2023, ARSESP, Plano de Saneamento RMSP. Valores ilustrativos para treinamento.
        </p>
      </div>
    </div>
  );
}

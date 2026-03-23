"use client";

import { regions } from "@/data/regions";
import { etas } from "@/data/etas";
import { etes } from "@/data/etes";
import { constructionWorks } from "@/data/construction";

// Marco Legal do Saneamento (Lei 14.026/2020) targets for 2033
const TARGETS_2033 = {
  water_supply_pct: 99,
  sewage_collection_pct: 90,
  sewage_treatment_pct: 90,
  water_loss_pct: 25,
};

// URAE1 contract targets (SABESP - RMSP) for 2029
const TARGETS_URAE1_2029 = {
  sewage_collection_pct: 93,
  sewage_treatment_pct: 85,
  water_loss_pct: 25,
};

function ProgressBar({
  label,
  current,
  target,
  target2029,
  color,
  tooltip,
}: {
  label: string;
  current: number;
  target: number;
  target2029?: number;
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
        {/* Target 2033 marker */}
        <div
          className="absolute top-0 h-3 w-0.5 bg-gray-600"
          style={{ left: `${Math.min(100, target)}%` }}
          title="Meta 2033"
        />
        {/* Target URAE1 2029 marker */}
        {target2029 && (
          <div
            className="absolute top-0 h-3 w-0.5 bg-orange-400"
            style={{ left: `${Math.min(100, (target2029 / target) * 100)}%` }}
            title="Meta URAE1 2029"
          />
        )}
      </div>
      <div className="flex justify-between mt-1">
        <span
          className={`text-[10px] font-medium ${
            isOnTrack ? "text-green-600" : "text-amber-600"
          }`}
        >
          {isOnTrack ? "No caminho" : `Faltam ${gap.toFixed(1)} p.p.`}
        </span>
        <div className="flex gap-2">
          {target2029 && (
            <span className="text-[10px] text-orange-500">URAE1 2029: {target2029}%</span>
          )}
          <span className="text-[10px] text-gray-400">Meta 2033</span>
        </div>
      </div>
    </div>
  );
}

export default function UniversalizationPanel() {
  const totalPopulation = regions.reduce((s, r) => s + r.population, 0);

  const avgCollection =
    regions.reduce((s, r) => s + r.sewage_collection_pct * r.population, 0) / totalPopulation;
  const avgTreatment =
    regions.reduce((s, r) => s + r.sewage_treatment_pct * r.population, 0) / totalPopulation;
  const avgWaterCoverage =
    regions.reduce((s, r) => s + r.water_coverage_pct * r.population, 0) / totalPopulation;

  // Simulated water loss
  const currentWaterLoss = 31.8;

  const totalCapacityETA = etas.reduce((s, e) => s + e.capacity_m3s, 0);
  const totalCapacityETE = etes.reduce((s, e) => s + e.capacity_m3s, 0);

  // Gap ranking: regions sorted by lowest treatment %
  const gapRanking = [...regions].sort(
    (a, b) => a.sewage_treatment_pct - b.sewage_treatment_pct
  );

  // Investment: R$75 bi total, executed since privatization (jul/2024)
  const totalInvestmentBRL = 75.0;
  // Q3 2024: ~R$2.1bi, Q4 2024: ~R$2.8bi, Q1 2025: ~R$2.5bi, Q2 2025: ~R$2.3bi, Q3 2025: ~R$2.6bi, Q4 2025: ~R$2.9bi, Q1 2026: ~R$2.4bi
  const executedQuarterly = [
    { quarter: "3T24", value: 2.1 },
    { quarter: "4T24", value: 2.8 },
    { quarter: "1T25", value: 2.5 },
    { quarter: "2T25", value: 2.3 },
    { quarter: "3T25", value: 2.6 },
    { quarter: "4T25", value: 2.9 },
    { quarter: "1T26", value: 2.4 },
  ];
  const totalExecuted = executedQuarterly.reduce((s, q) => s + q.value, 0);

  // Construction works summary
  const totalConstructionInvestment = constructionWorks.reduce((s, c) => s + c.investment_brl_mi, 0);
  const avgProgress = Math.round(constructionWorks.reduce((s, c) => s + c.progress_pct, 0) / constructionWorks.length);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-base font-bold text-[#00A651] mb-1">
        Universalização do Saneamento
      </h2>
      <p className="text-[10px] text-gray-400 mb-4">
        Marco Legal (Lei 14.026/2020) + Contrato URAE1 (RMSP)
      </p>

      {/* Progress Bars */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Progresso das Metas</h3>

        <ProgressBar
          label="Cobertura de Água"
          current={avgWaterCoverage}
          target={TARGETS_2033.water_supply_pct}
          color="#005BAA"
          tooltip="% da população com acesso à rede de água tratada"
        />
        <ProgressBar
          label="Coleta de Esgoto"
          current={avgCollection}
          target={TARGETS_2033.sewage_collection_pct}
          target2029={TARGETS_URAE1_2029.sewage_collection_pct}
          color="#D97706"
          tooltip="% do esgoto gerado que é coletado pela rede"
        />
        <ProgressBar
          label="Tratamento de Esgoto"
          current={avgTreatment}
          target={TARGETS_2033.sewage_treatment_pct}
          target2029={TARGETS_URAE1_2029.sewage_treatment_pct}
          color="#00A651"
          tooltip="% do esgoto coletado que recebe tratamento adequado"
        />
        <ProgressBar
          label={`Perdas de Água (máx ${TARGETS_2033.water_loss_pct}%)`}
          current={100 - currentWaterLoss}
          target={100 - TARGETS_2033.water_loss_pct}
          color="#8B5CF6"
          tooltip="Inverso do índice de perdas na distribuição"
        />

        <div className="flex gap-3 mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-[9px] text-gray-400">
            <div className="w-3 h-0.5 bg-gray-600" /> Meta 2033
          </div>
          <div className="flex items-center gap-1 text-[9px] text-orange-500">
            <div className="w-3 h-0.5 bg-orange-400" /> Meta URAE1 2029
          </div>
        </div>
      </div>

      {/* Investment Tracker */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Investimentos (pós-privatização)</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Investimento total estimado</span>
            <span className="font-bold text-[#005BAA]">R$ {totalInvestmentBRL} bi</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Executado desde jul/2024</span>
            <span className="font-bold text-[#00A651]">R$ {totalExecuted.toFixed(1)} bi</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div
              className="h-2.5 rounded-full bg-[#00A651]"
              style={{ width: `${(totalExecuted / totalInvestmentBRL) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>{((totalExecuted / totalInvestmentBRL) * 100).toFixed(1)}% executado</span>
            <span>R$ {(totalInvestmentBRL - totalExecuted).toFixed(1)} bi restante</span>
          </div>
        </div>

        {/* Quarterly breakdown */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-[10px] text-gray-500 font-medium mb-1.5">Execução trimestral (R$ bi)</p>
          <div className="flex gap-1">
            {executedQuarterly.map((q) => (
              <div key={q.quarter} className="flex-1 text-center">
                <div className="bg-[#00A651]/10 rounded-sm relative" style={{ height: 40 }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-[#00A651] rounded-sm"
                    style={{ height: `${(q.value / 3.5) * 100}%` }}
                  />
                </div>
                <div className="text-[8px] text-gray-400 mt-0.5">{q.quarter}</div>
                <div className="text-[9px] font-medium text-gray-600">{q.value}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-100 pt-2">
          Privatização SABESP (jul/2024) trouxe R$ 6,9 bi ao Estado. Regulação ARSESP com revisão tarifária quinquenal.
        </p>
      </div>

      {/* Construction Works Summary */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Obras em Andamento</h3>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="text-center p-1.5 bg-orange-50 rounded">
            <div className="text-base font-bold text-orange-600">{constructionWorks.length}</div>
            <div className="text-[9px] text-gray-500">obras</div>
          </div>
          <div className="text-center p-1.5 bg-orange-50 rounded">
            <div className="text-base font-bold text-orange-600">{avgProgress}%</div>
            <div className="text-[9px] text-gray-500">progresso médio</div>
          </div>
          <div className="text-center p-1.5 bg-orange-50 rounded">
            <div className="text-base font-bold text-orange-600">{(totalConstructionInvestment / 1000).toFixed(1)}</div>
            <div className="text-[9px] text-gray-500">R$ bi investidos</div>
          </div>
        </div>
        <div className="space-y-1.5">
          {constructionWorks.slice(0, 4).map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-medium text-gray-700 truncate">{c.name}</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-0.5">
                  <div
                    className="h-1.5 rounded-full bg-orange-500"
                    style={{ width: `${c.progress_pct}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-gray-500 min-w-[30px] text-right">{c.progress_pct}%</span>
            </div>
          ))}
        </div>
      </div>

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
            const gap = TARGETS_2033.sewage_treatment_pct - r.sewage_treatment_pct;
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
          Fontes: SNIS 2023, ARSESP, Contrato URAE1, SABESP RI. Investimentos atualizados trimestralmente. Valores ilustrativos para treinamento.
        </p>
      </div>
    </div>
  );
}

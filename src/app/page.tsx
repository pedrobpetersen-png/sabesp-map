"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import ReservoirDashboard from "@/components/ReservoirDashboard";
import UniversalizationPanel from "@/components/UniversalizationPanel";
import RegionalComparison from "@/components/RegionalComparison";
import { LayerVisibility, ChoroplethMetric } from "@/types";
import { etas } from "@/data/etas";
import { etes } from "@/data/etes";
import { powerPlants } from "@/data/powerplants";
import { reservoirs } from "@/data/reservoirs";
import { getLevelColor } from "@/lib/utils";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#005BAA] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Carregando mapa...</p>
      </div>
    </div>
  ),
});

type RightTab = "reservoirs" | "universalization" | "comparison";
type ViewMode = "investor" | "engineer";

export default function Home() {
  const [layers, setLayers] = useState<LayerVisibility>({
    etas: true,
    etes: true,
    reservoirs: true,
    pipelines_water: true,
    pipelines_sewage: true,
    choropleth: true,
    power_plants: true,
  });

  const [choroplethMetric, setChoroplethMetric] =
    useState<ChoroplethMetric>("water_consumption_m3");

  const [is3D, setIs3D] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReservoir, setSelectedReservoir] = useState<string | null>(null);
  const [flyToReservoirId, setFlyToReservoirId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [rightTab, setRightTab] = useState<RightTab>("reservoirs");
  const [viewMode, setViewMode] = useState<ViewMode>("engineer");

  const avgReservoirLevel = useMemo(() => {
    const sum = reservoirs.reduce((s, r) => s + r.current_level_pct, 0);
    return Math.round((sum / reservoirs.length) * 10) / 10;
  }, []);

  const handleToggleLayer = useCallback((key: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSelectReservoir = useCallback((id: string | null) => {
    setSelectedReservoir(id);
    setShowRightPanel(true);
    setRightTab("reservoirs");
  }, []);

  const handleDashboardSelect = useCallback((id: string) => {
    setSelectedReservoir(id);
    setFlyToReservoirId(id);
    setShowRightPanel(true);
    setRightTab("reservoirs");
    setTimeout(() => setFlyToReservoirId(null), 2000);
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
      {/* Left Sidebar - Collapsible */}
      <div
        className={`bg-white border-r border-gray-200 flex flex-col shadow-sm transition-all duration-300 ease-in-out overflow-hidden ${
          showSidebar ? "w-[270px] min-w-[270px] p-4" : "w-0 min-w-0 p-0"
        }`}
      >
        {showSidebar && (
          <Sidebar
            layers={layers}
            onToggleLayer={handleToggleLayer}
            choroplethMetric={choroplethMetric}
            onChoroplethMetricChange={setChoroplethMetric}
            is3D={is3D}
            onToggle3D={() => setIs3D((prev) => !prev)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
          />
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          layers={layers}
          choroplethMetric={choroplethMetric}
          searchQuery={searchQuery}
          is3D={is3D}
          onSelectReservoir={handleSelectReservoir}
          flyToReservoirId={flyToReservoirId}
        />

        {/* Left sidebar toggle */}
        <button
          onClick={() => setShowSidebar((prev) => !prev)}
          className="absolute top-1/2 left-0 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm border border-gray-200 border-l-0 rounded-r-lg px-1.5 py-4 shadow-md hover:bg-[#005BAA]/5 hover:border-[#005BAA]/30 transition-colors group"
          title={showSidebar ? "Ocultar painel esquerdo" : "Mostrar painel esquerdo"}
        >
          <svg
            className={`w-4 h-4 text-gray-400 group-hover:text-[#005BAA] transition-transform duration-300 ${
              showSidebar ? "" : "rotate-180"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Top bar */}
        <div className="absolute top-4 left-10 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-4 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#005BAA] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">S</span>
            </div>
            <span className="text-sm font-bold text-[#005BAA]">SABESP</span>
          </div>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-gray-400">ETAs</span>
              <span className="text-[#005BAA] font-bold ml-1">{etas.length}</span>
            </div>
            <div>
              <span className="text-gray-400">ETEs</span>
              <span className="text-amber-600 font-bold ml-1">{etes.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Reserv.</span>
              <span className="text-[#00A651] font-bold ml-1">{reservoirs.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Usinas</span>
              <span className="text-amber-500 font-bold ml-1">{powerPlants.length}</span>
            </div>
          </div>
          <div className="h-5 w-px bg-gray-200" />
          {/* Mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("engineer")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                viewMode === "engineer"
                  ? "bg-[#005BAA] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Engenheiro
            </button>
            <button
              onClick={() => setViewMode("investor")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                viewMode === "investor"
                  ? "bg-[#00A651] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Investidor
            </button>
          </div>
        </div>

        {/* Right panel toggle */}
        <button
          onClick={() => setShowRightPanel((prev) => !prev)}
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-600 hover:text-[#005BAA] hover:border-[#005BAA] transition-colors shadow-md font-medium z-10"
        >
          {showRightPanel ? "Ocultar Painel" : "Painel de Dados"}
        </button>

        {/* Right panel toggle arrow (when collapsed) */}
        {!showRightPanel && (
          <button
            onClick={() => setShowRightPanel(true)}
            className="absolute top-1/2 right-0 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm border border-gray-200 border-r-0 rounded-l-lg px-1.5 py-4 shadow-md hover:bg-[#005BAA]/5 hover:border-[#005BAA]/30 transition-colors group"
            title="Mostrar painel direito"
          >
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-[#005BAA]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Water Status Bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-5 py-2 flex items-center gap-4 shadow-md z-10">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#005BAA]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5C8 1.5 3 7 3 10a5 5 0 0010 0c0-3-5-8.5-5-8.5z" />
            </svg>
            <span className="text-xs text-gray-500">Nível médio reservatórios</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: `${avgReservoirLevel}%`,
                  backgroundColor: getLevelColor(avgReservoirLevel),
                }}
              />
            </div>
            <span
              className="text-sm font-bold min-w-[40px]"
              style={{ color: getLevelColor(avgReservoirLevel) }}
            >
              {avgReservoirLevel}%
            </span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-gray-400">Simulação em tempo real</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Collapsible */}
      <div
        className={`bg-gray-50 border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
          showRightPanel ? "w-[360px] min-w-[360px]" : "w-0 min-w-0"
        }`}
      >
        {showRightPanel && (
          <>
            {/* Right panel tabs */}
            <div className="flex border-b border-gray-200 bg-white shrink-0">
              <button
                onClick={() => setRightTab("reservoirs")}
                className={`flex-1 py-2.5 text-[11px] font-medium transition-colors ${
                  rightTab === "reservoirs"
                    ? "text-[#005BAA] border-b-2 border-[#005BAA] bg-[#005BAA]/5"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Reservatórios
              </button>
              <button
                onClick={() => setRightTab("universalization")}
                className={`flex-1 py-2.5 text-[11px] font-medium transition-colors ${
                  rightTab === "universalization"
                    ? "text-[#00A651] border-b-2 border-[#00A651] bg-[#00A651]/5"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Universalização
              </button>
              <button
                onClick={() => setRightTab("comparison")}
                className={`flex-1 py-2.5 text-[11px] font-medium transition-colors ${
                  rightTab === "comparison"
                    ? "text-[#005BAA] border-b-2 border-[#005BAA] bg-[#005BAA]/5"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Comparativo
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-4">
              {rightTab === "reservoirs" && (
                <ReservoirDashboard
                  selectedId={selectedReservoir}
                  onSelect={handleDashboardSelect}
                  onClose={() => setSelectedReservoir(null)}
                  viewMode={viewMode}
                />
              )}
              {rightTab === "universalization" && (
                <UniversalizationPanel viewMode={viewMode} />
              )}
              {rightTab === "comparison" && (
                <RegionalComparison viewMode={viewMode} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

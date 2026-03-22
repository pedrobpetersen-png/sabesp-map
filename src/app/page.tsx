"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import ReservoirDashboard from "@/components/ReservoirDashboard";
import { LayerVisibility, ChoroplethMetric } from "@/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Carregando mapa...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [layers, setLayers] = useState<LayerVisibility>({
    etas: true,
    etes: true,
    reservoirs: true,
    pipelines_water: true,
    pipelines_sewage: true,
    choropleth: true,
  });

  const [choroplethMetric, setChoroplethMetric] =
    useState<ChoroplethMetric>("water_consumption_m3");

  const [is3D, setIs3D] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReservoir, setSelectedReservoir] = useState<string | null>(
    null
  );
  const [showDashboard, setShowDashboard] = useState(true);

  const handleToggleLayer = useCallback((key: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSelectReservoir = useCallback((id: string | null) => {
    setSelectedReservoir(id);
    setShowDashboard(true);
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left Sidebar - Controls */}
      <div className="w-64 min-w-[256px] bg-slate-900 border-r border-slate-700 p-4 flex flex-col">
        <Sidebar
          layers={layers}
          onToggleLayer={handleToggleLayer}
          choroplethMetric={choroplethMetric}
          onChoroplethMetricChange={setChoroplethMetric}
          is3D={is3D}
          onToggle3D={() => setIs3D((prev) => !prev)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          layers={layers}
          choroplethMetric={choroplethMetric}
          searchQuery={searchQuery}
          is3D={is3D}
          onSelectReservoir={handleSelectReservoir}
        />

        {/* Stats bar */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2 flex gap-6 text-xs">
          <div>
            <span className="text-slate-400">ETAs</span>
            <span className="text-blue-400 font-bold ml-1">15</span>
          </div>
          <div>
            <span className="text-slate-400">ETEs</span>
            <span className="text-orange-400 font-bold ml-1">14</span>
          </div>
          <div>
            <span className="text-slate-400">Reservatórios</span>
            <span className="text-cyan-400 font-bold ml-1">7</span>
          </div>
          <div>
            <span className="text-slate-400">Regiões</span>
            <span className="text-green-400 font-bold ml-1">12</span>
          </div>
        </div>

        {/* Dashboard toggle */}
        <button
          onClick={() => setShowDashboard((prev) => !prev)}
          className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 hover:text-white hover:border-cyan-500 transition-colors"
        >
          {showDashboard ? "Ocultar Painel" : "Reservatórios"}
        </button>
      </div>

      {/* Right Panel - Reservoir Dashboard */}
      {showDashboard && (
        <div className="w-80 min-w-[320px] bg-slate-900 border-l border-slate-700 p-4 overflow-y-auto">
          <ReservoirDashboard
            selectedId={selectedReservoir}
            onClose={() => setSelectedReservoir(null)}
          />
        </div>
      )}
    </div>
  );
}

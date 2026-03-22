"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import ReservoirDashboard from "@/components/ReservoirDashboard";
import { LayerVisibility, ChoroplethMetric } from "@/types";

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
  const [showDashboard, setShowDashboard] = useState(true);

  const handleToggleLayer = useCallback((key: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSelectReservoir = useCallback((id: string | null) => {
    setSelectedReservoir(id);
    setShowDashboard(true);
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-[270px] min-w-[270px] bg-white border-r border-gray-200 p-4 flex flex-col shadow-sm">
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

        {/* Top bar - SABESP branded */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-5 py-2.5 flex items-center gap-5 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#005BAA] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">S</span>
            </div>
            <span className="text-sm font-bold text-[#005BAA]">SABESP</span>
          </div>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex gap-5 text-xs">
            <div>
              <span className="text-gray-400">ETAs</span>
              <span className="text-[#005BAA] font-bold ml-1">15</span>
            </div>
            <div>
              <span className="text-gray-400">ETEs</span>
              <span className="text-amber-600 font-bold ml-1">14</span>
            </div>
            <div>
              <span className="text-gray-400">Reservatórios</span>
              <span className="text-[#00A651] font-bold ml-1">8</span>
            </div>
            <div>
              <span className="text-gray-400">Usinas</span>
              <span className="text-amber-500 font-bold ml-1">11</span>
            </div>
          </div>
        </div>

        {/* Dashboard toggle */}
        <button
          onClick={() => setShowDashboard((prev) => !prev)}
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-600 hover:text-[#005BAA] hover:border-[#005BAA] transition-colors shadow-md font-medium"
        >
          {showDashboard ? "Ocultar Painel" : "Reservatórios"}
        </button>
      </div>

      {/* Right Panel */}
      {showDashboard && (
        <div className="w-[340px] min-w-[340px] bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
          <ReservoirDashboard
            selectedId={selectedReservoir}
            onClose={() => setSelectedReservoir(null)}
          />
        </div>
      )}
    </div>
  );
}

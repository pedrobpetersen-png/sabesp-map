"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Map, {
  NavigationControl,
  Popup,
  Source,
  Layer,
  MapRef,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { etas } from "@/data/etas";
import { etes } from "@/data/etes";
import { reservoirs } from "@/data/reservoirs";
import { pipelines } from "@/data/pipelines";
import { regions } from "@/data/regions";
import { powerPlants } from "@/data/powerplants";
import { constructionWorks } from "@/data/construction";
import {
  LayerVisibility,
  ChoroplethMetric,
} from "@/types";
import {
  getLevelColor,
  choroplethColor,
  SABESP,
} from "@/lib/utils";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const SP_CENTER = { latitude: -23.2, longitude: -47.0, zoom: 7 };

// === SVG Icon Definitions ===

function circleIcon(color: string, inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="white" stroke="${color}" stroke-width="2.5"/><g transform="translate(8,8) scale(1.5)" fill="${color}">${inner}</g></svg>`;
}

function lakeIcon(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="white" stroke="${color}" stroke-width="2.5"/><g transform="translate(7,9) scale(1.875)"><path d="M1 7c2-1.5 5-2.5 7-.5s5 2 7 .5v4c-2 1.5-5 2.5-7 .5S3 9.5 1 11V7z" fill="${color}" opacity="0.2"/><path d="M1 7c2-1.5 5-2.5 7-.5s5 2 7 .5" fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round"/><path d="M1 11c2-1.5 5-2.5 7-.5s5 2 7 .5" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/></g></svg>`;
}

const MAP_ICON_SVGS: Record<string, string> = {
  "icon-eta": circleIcon(
    "#005BAA",
    `<path d="M8 1.5C8 1.5 3 7 3 10a5 5 0 0010 0c0-3-5-8.5-5-8.5z"/>`
  ),
  "icon-ete": circleIcon(
    "#D97706",
    `<path d="M2 4h12v2H2z"/><path d="M4 7h8v1.5c0 2.5-1.8 4.5-4 4.5s-4-2-4-4.5V7z"/><circle cx="5" cy="2.5" r="1"/><circle cx="8" cy="2" r="1"/><circle cx="11" cy="2.5" r="1"/>`
  ),
  "icon-bolt": circleIcon("#F59E0B", `<path d="M9 1L4 9h4l-1 6 5-8H8l1-6z"/>`),
  "icon-bolt-green": circleIcon("#10B981", `<path d="M9 1L4 9h4l-1 6 5-8H8l1-6z"/>`),
  "icon-construction": circleIcon(
    "#F97316",
    `<path d="M7 1h2v3h4l-1.5 4H4.5L3 4h4V1z"/><rect x="4" y="9" width="8" height="2" rx="0.5"/><rect x="5" y="11" width="1.5" height="4"/><rect x="9.5" y="11" width="1.5" height="4"/><rect x="3" y="14.5" width="10" height="1.5" rx="0.5"/>`
  ),
  "icon-reservoir-green": lakeIcon("#00A651"),
  "icon-reservoir-amber": lakeIcon("#F59E0B"),
  "icon-reservoir-red": lakeIcon("#EF4444"),
};

function loadSvgIcon(
  map: mapboxgl.Map,
  name: string,
  svgString: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (!map.hasImage(name)) {
        map.addImage(name, img);
      }
      resolve();
    };
    img.onerror = reject;
    img.src =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
  });
}

// === Component ===

interface MapViewProps {
  layers: LayerVisibility;
  choroplethMetric: ChoroplethMetric;
  flyToTarget: { lat: number; lng: number; zoom: number } | null;
  is3D: boolean;
  onSelectReservoir: (id: string | null) => void;
  flyToReservoirId: string | null;
}

type PopupInfo = {
  lat: number;
  lng: number;
  content: React.ReactNode;
} | null;

export default function MapView({
  layers,
  choroplethMetric,
  flyToTarget,
  is3D,
  onSelectReservoir,
  flyToReservoirId,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [iconsLoaded, setIconsLoaded] = useState(false);

  // ResizeObserver to auto-resize map when container changes (sidebar collapse)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current.getMap();
    const container = map.getContainer();
    const parent = container.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(() => {
      map.resize();
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [mapLoaded]);

  // Load SVG icons into map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current.getMap();
    Promise.all(
      Object.entries(MAP_ICON_SVGS).map(([name, svg]) =>
        loadSvgIcon(map, name, svg)
      )
    ).then(() => setIconsLoaded(true));
  }, [mapLoaded]);

  // Fly to search result
  useEffect(() => {
    if (flyToTarget && mapRef.current) {
      mapRef.current.flyTo({
        center: [flyToTarget.lng, flyToTarget.lat],
        zoom: flyToTarget.zoom,
        duration: 1500,
      });
    }
  }, [flyToTarget]);

  // Fly to reservoir when selected from dashboard
  useEffect(() => {
    if (flyToReservoirId && mapRef.current) {
      const res = reservoirs.find((r) => r.id === flyToReservoirId);
      if (res) {
        mapRef.current.flyTo({
          center: [res.lng, res.lat],
          zoom: 11,
          duration: 1500,
        });
      }
    }
  }, [flyToReservoirId]);

  useEffect(() => {
    if (mapRef.current && is3D) {
      mapRef.current.getMap().easeTo({ pitch: 60, bearing: -20, duration: 1000 });
    } else if (mapRef.current && !is3D) {
      mapRef.current.getMap().easeTo({ pitch: 0, bearing: 0, duration: 1000 });
    }
  }, [is3D]);

  // === GeoJSON data ===

  const etaGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: etas.map((e) => ({
      type: "Feature" as const,
      properties: {
        id: e.id,
        name: e.name,
        capacity: e.capacity_m3s,
        volume: e.volume_treated_m3_month,
        municipality: e.municipality,
        system: e.system,
        description: e.description || "",
        type: "eta",
      },
      geometry: { type: "Point" as const, coordinates: [e.lng, e.lat] },
    })),
  };

  const eteGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: etes.map((e) => ({
      type: "Feature" as const,
      properties: {
        id: e.id,
        name: e.name,
        capacity: e.capacity_m3s,
        treatment_pct: e.treatment_pct,
        municipality: e.municipality,
        system: e.system,
        description: e.description || "",
        type: "ete",
      },
      geometry: { type: "Point" as const, coordinates: [e.lng, e.lat] },
    })),
  };

  const reservoirGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: reservoirs.map((r) => ({
      type: "Feature" as const,
      properties: {
        id: r.id,
        name: r.name,
        total_volume: r.total_volume_hm3,
        current_level: r.current_level_pct,
        color: getLevelColor(r.current_level_pct),
        description: r.description || "",
        type: "reservoir",
      },
      geometry: { type: "Point" as const, coordinates: [r.lng, r.lat] },
    })),
  };

  const powerPlantGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: powerPlants.map((p) => ({
      type: "Feature" as const,
      properties: {
        id: p.id,
        name: p.name,
        pp_type: p.type,
        capacity_mw: p.capacity_mw,
        status: p.status,
        source: p.source,
        description: p.description,
        type: "power_plant",
      },
      geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
    })),
  };

  const constructionGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: constructionWorks.map((c) => ({
      type: "Feature" as const,
      properties: {
        id: c.id,
        name: c.name,
        cw_type: c.type,
        status: c.status,
        progress_pct: c.progress_pct,
        investment_brl_mi: c.investment_brl_mi,
        expected_completion: c.expected_completion,
        description: c.description,
        type: "construction",
      },
      geometry: { type: "Point" as const, coordinates: [c.lng, c.lat] },
    })),
  };

  const waterPipelines = pipelines.filter((p) => p.type === "water");
  const sewagePipelines = pipelines.filter((p) => p.type === "sewage");

  const waterPipeGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: waterPipelines.map((p) => ({
      type: "Feature" as const,
      properties: { id: p.id, name: p.name, diameter: p.diameter_mm, type: "water" },
      geometry: { type: "LineString" as const, coordinates: p.coordinates },
    })),
  };

  const sewagePipeGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: sewagePipelines.map((p) => ({
      type: "Feature" as const,
      properties: { id: p.id, name: p.name, diameter: p.diameter_mm, type: "sewage" },
      geometry: { type: "LineString" as const, coordinates: p.coordinates },
    })),
  };

  const metricValues = regions.map((r) => r[choroplethMetric] as number);
  const minVal = Math.min(...metricValues);
  const maxVal = Math.max(...metricValues);
  const isPct = choroplethMetric.includes("pct");

  const regionGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: regions.map((r) => ({
      type: "Feature" as const,
      properties: {
        id: r.id,
        name: r.name,
        municipality: r.municipality,
        value: r[choroplethMetric],
        color: choroplethColor(r[choroplethMetric] as number, minVal, maxVal, isPct),
        water_coverage_pct: r.water_coverage_pct,
        water_consumption_m3: r.water_consumption_m3,
        sewage_generation_m3: r.sewage_generation_m3,
        sewage_collection_pct: r.sewage_collection_pct,
        sewage_treatment_pct: r.sewage_treatment_pct,
        population: r.population,
      },
      geometry: { type: "Polygon" as const, coordinates: r.coordinates },
    })),
  };

  // === Click handler ===

  const handleClick = useCallback(
    (event: mapboxgl.MapLayerMouseEvent) => {
      const features = event.features;
      if (!features || features.length === 0) {
        setPopupInfo(null);
        return;
      }
      const feature = features[0];
      const props = feature.properties;
      if (!props) return;
      const coords = event.lngLat;

      if (props.type === "eta") {
        setPopupInfo({
          lat: coords.lat,
          lng: coords.lng,
          content: (
            <div className="text-sm text-gray-800">
              <h3 className="font-bold text-[#005BAA] text-base">{props.name}</h3>
              <p className="text-xs text-gray-500 mt-1 mb-2">{props.description}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span className="text-gray-500">Município</span>
                <span className="font-medium">{props.municipality}</span>
                <span className="text-gray-500">Sistema</span>
                <span className="font-medium">{props.system}</span>
                <span className="text-gray-500">Capacidade</span>
                <span className="font-medium">{Number(props.capacity).toFixed(1)} m³/s</span>
                <span className="text-gray-500">Volume mensal</span>
                <span className="font-medium">{(Number(props.volume) / 1_000_000).toFixed(1)} M m³/mês</span>
              </div>
            </div>
          ),
        });
      } else if (props.type === "ete") {
        setPopupInfo({
          lat: coords.lat,
          lng: coords.lng,
          content: (
            <div className="text-sm text-gray-800">
              <h3 className="font-bold text-[#D97706] text-base">{props.name}</h3>
              <p className="text-xs text-gray-500 mt-1 mb-2">{props.description}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span className="text-gray-500">Município</span>
                <span className="font-medium">{props.municipality}</span>
                <span className="text-gray-500">Sistema</span>
                <span className="font-medium">{props.system}</span>
                <span className="text-gray-500">Capacidade</span>
                <span className="font-medium">{Number(props.capacity).toFixed(1)} m³/s</span>
                <span className="text-gray-500">Eficiência</span>
                <span className="font-medium">{props.treatment_pct}%</span>
              </div>
            </div>
          ),
        });
      } else if (props.type === "reservoir") {
        onSelectReservoir(props.id);
        setPopupInfo({
          lat: coords.lat,
          lng: coords.lng,
          content: (
            <div className="text-sm text-gray-800">
              <h3 className="font-bold text-[#005BAA] text-base">{props.name}</h3>
              <p className="text-xs text-gray-500 mt-1 mb-2">{props.description}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span className="text-gray-500">Volume total</span>
                <span className="font-medium">{props.total_volume} hm³</span>
                <span className="text-gray-500">Nível atual</span>
                <span className="font-bold" style={{ color: props.color }}>
                  {props.current_level}%
                </span>
              </div>
              <p className="text-xs text-[#005BAA] mt-2 font-medium">Veja previsão no painel lateral</p>
            </div>
          ),
        });
      } else if (props.type === "power_plant") {
        setPopupInfo({
          lat: coords.lat,
          lng: coords.lng,
          content: (
            <div className="text-sm text-gray-800">
              <h3 className="font-bold text-[#F59E0B] text-base">{props.name}</h3>
              <p className="text-xs text-gray-500 mt-1 mb-2">{props.description}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span className="text-gray-500">Tipo</span>
                <span className="font-medium">{props.pp_type === "hydroelectric" ? "Hidrelétrica" : "Autoprodução"}</span>
                <span className="text-gray-500">Capacidade</span>
                <span className="font-medium">{props.capacity_mw > 0 ? props.capacity_mw + " MW" : "Elevatória"}</span>
                <span className="text-gray-500">Origem</span>
                <span className="font-medium">{props.source}</span>
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${props.status === "operational" ? "text-green-600" : props.status === "restricted" ? "text-amber-600" : "text-red-600"}`}>
                  {props.status === "operational" ? "Operacional" : props.status === "restricted" ? "Restrições" : "Manutenção"}
                </span>
              </div>
            </div>
          ),
        });
      } else if (props.type === "construction") {
        const statusLabel = props.status === "advanced" ? "Avançada" : props.status === "in_progress" ? "Em andamento" : "Planejamento";
        const statusColor = props.status === "advanced" ? "text-green-600" : props.status === "in_progress" ? "text-amber-600" : "text-gray-500";
        setPopupInfo({
          lat: coords.lat,
          lng: coords.lng,
          content: (
            <div className="text-sm text-gray-800">
              <h3 className="font-bold text-orange-600 text-base">{props.name}</h3>
              <p className="text-xs text-gray-500 mt-1 mb-2">{props.description}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${statusColor}`}>{statusLabel}</span>
                <span className="text-gray-500">Progresso</span>
                <span className="font-medium">{props.progress_pct}%</span>
                <span className="text-gray-500">Investimento</span>
                <span className="font-medium">R$ {props.investment_brl_mi} mi</span>
                <span className="text-gray-500">Conclusão prev.</span>
                <span className="font-medium">{props.expected_completion}</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-orange-500" style={{ width: `${props.progress_pct}%` }} />
                </div>
              </div>
            </div>
          ),
        });
      } else if (props.name && props.population) {
        setPopupInfo({
          lat: coords.lat,
          lng: coords.lng,
          content: (
            <div className="text-sm text-gray-800">
              <h3 className="font-bold text-[#00A651] text-base">{props.name}</h3>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mt-2">
                <span className="text-gray-500">População</span>
                <span className="font-medium">{Number(props.population).toLocaleString()}</span>
                <span className="text-gray-500">Cobertura água</span>
                <span className="font-medium text-[#005BAA]">{props.water_coverage_pct}%</span>
                <span className="text-gray-500">Consumo água</span>
                <span className="font-medium">{(Number(props.water_consumption_m3) / 1_000_000).toFixed(1)} M m³/mês</span>
                <span className="text-gray-500">Esgoto gerado</span>
                <span className="font-medium">{(Number(props.sewage_generation_m3) / 1_000_000).toFixed(1)} M m³/mês</span>
                <span className="text-gray-500">Coleta esgoto</span>
                <span className="font-medium">{props.sewage_collection_pct}%</span>
                <span className="text-gray-500">Tratamento esgoto</span>
                <span className="font-medium">{props.sewage_treatment_pct}%</span>
              </div>
            </div>
          ),
        });
      }
    },
    [onSelectReservoir]
  );

  return (
    <Map
      ref={mapRef}
      initialViewState={SP_CENTER}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      interactiveLayerIds={[
        ...(iconsLoaded
          ? [
              "eta-symbols",
              "ete-symbols",
              "reservoir-symbols",
              "power-plant-symbols",
              "construction-symbols",
            ]
          : []),
        "region-fill",
      ]}
      onClick={handleClick}
      onLoad={() => setMapLoaded(true)}
      terrain={is3D ? { source: "mapbox-dem", exaggeration: 1.5 } : undefined}
    >
      <NavigationControl position="top-right" />

      {/* 3D terrain + buildings */}
      {is3D && mapLoaded && (
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        >
          <Layer
            id="sky-layer"
            type="sky"
            paint={{
              "sky-type": "atmosphere",
              "sky-atmosphere-sun": [0, 90],
              "sky-atmosphere-sun-intensity": 15,
            }}
          />
        </Source>
      )}

      {/* 3D Buildings - visible when zoomed in */}
      {is3D && mapLoaded && (
        <Layer
          id="3d-buildings"
          source="composite"
          source-layer="building"
          type="fill-extrusion"
          minzoom={13}
          paint={{
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["get", "height"],
              0, "#E2E8F0",
              50, "#CBD5E1",
              200, "#94A3B8",
            ],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": 0.7,
          }}
        />
      )}

      {/* Choropleth Regions */}
      {layers.choropleth && (
        <Source id="regions" type="geojson" data={regionGeoJSON}>
          <Layer
            id="region-fill"
            type="fill"
            paint={{
              "fill-color": ["get", "color"],
              "fill-opacity": 0.3,
            }}
          />
          <Layer
            id="region-outline"
            type="line"
            paint={{
              "line-color": SABESP.gray400,
              "line-width": 1.5,
            }}
          />
          <Layer
            id="region-label"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-size": 11,
              "text-anchor": "center",
            }}
            paint={{
              "text-color": SABESP.gray700,
              "text-halo-color": "#FFFFFF",
              "text-halo-width": 1.5,
            }}
          />
        </Source>
      )}

      {/* Water Pipelines */}
      {layers.pipelines_water && (
        <Source id="water-pipes" type="geojson" data={waterPipeGeoJSON}>
          <Layer
            id="water-pipe-line"
            type="line"
            paint={{
              "line-color": SABESP.blue,
              "line-width": ["interpolate", ["linear"], ["get", "diameter"], 800, 2, 3600, 6],
              "line-opacity": 0.75,
            }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
        </Source>
      )}

      {/* Sewage Pipelines */}
      {layers.pipelines_sewage && (
        <Source id="sewage-pipes" type="geojson" data={sewagePipeGeoJSON}>
          <Layer
            id="sewage-pipe-line"
            type="line"
            paint={{
              "line-color": "#8B5CF6",
              "line-width": ["interpolate", ["linear"], ["get", "diameter"], 800, 2, 2500, 5],
              "line-opacity": 0.75,
              "line-dasharray": [3, 2],
            }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
        </Source>
      )}

      {/* ETAs - SVG Icons */}
      {layers.etas && iconsLoaded && (
        <Source id="etas" type="geojson" data={etaGeoJSON}>
          <Layer
            id="eta-symbols"
            type="symbol"
            layout={{
              "icon-image": "icon-eta",
              "icon-size": [
                "interpolate",
                ["linear"],
                ["get", "capacity"],
                0.35, 0.45,
                33, 1.1,
              ],
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
            }}
          />
          <Layer
            id="eta-labels"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-size": 11,
              "text-offset": [0, 2],
              "text-anchor": "top",
            }}
            paint={{
              "text-color": SABESP.blueDark,
              "text-halo-color": "#FFFFFF",
              "text-halo-width": 1.5,
            }}
            minzoom={9}
          />
        </Source>
      )}

      {/* ETEs - SVG Icons */}
      {layers.etes && iconsLoaded && (
        <Source id="etes" type="geojson" data={eteGeoJSON}>
          <Layer
            id="ete-symbols"
            type="symbol"
            layout={{
              "icon-image": "icon-ete",
              "icon-size": [
                "interpolate",
                ["linear"],
                ["get", "capacity"],
                0.3, 0.45,
                12, 0.9,
              ],
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
            }}
          />
          <Layer
            id="ete-labels"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-size": 11,
              "text-offset": [0, 2],
              "text-anchor": "top",
            }}
            paint={{
              "text-color": "#92400E",
              "text-halo-color": "#FFFFFF",
              "text-halo-width": 1.5,
            }}
            minzoom={9}
          />
        </Source>
      )}

      {/* Reservoirs - Lake SVG Icons */}
      {layers.reservoirs && iconsLoaded && (
        <Source id="reservoirs" type="geojson" data={reservoirGeoJSON}>
          <Layer
            id="reservoir-symbols"
            type="symbol"
            layout={{
              "icon-image": [
                "case",
                [">=", ["get", "current_level"], 60],
                "icon-reservoir-green",
                [">=", ["get", "current_level"], 30],
                "icon-reservoir-amber",
                "icon-reservoir-red",
              ],
              "icon-size": 0.85,
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
            }}
          />
          <Layer
            id="reservoir-labels"
            type="symbol"
            layout={{
              "text-field": [
                "concat",
                ["get", "name"],
                "\n",
                ["to-string", ["get", "current_level"]],
                "%",
              ],
              "text-size": 11,
              "text-offset": [0, 2.8],
              "text-anchor": "top",
              "text-line-height": 1.3,
            }}
            paint={{
              "text-color": SABESP.gray700,
              "text-halo-color": "#FFFFFF",
              "text-halo-width": 1.5,
            }}
            minzoom={8}
          />
        </Source>
      )}

      {/* Power Plants - SVG Icons */}
      {layers.power_plants && iconsLoaded && (
        <Source id="power-plants" type="geojson" data={powerPlantGeoJSON}>
          <Layer
            id="power-plant-symbols"
            type="symbol"
            layout={{
              "icon-image": [
                "case",
                ["==", ["get", "pp_type"], "hydroelectric"],
                "icon-bolt",
                "icon-bolt-green",
              ],
              "icon-size": [
                "case",
                ["==", ["get", "pp_type"], "hydroelectric"],
                0.65,
                0.5,
              ],
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
            }}
          />
          <Layer
            id="power-plant-labels"
            type="symbol"
            layout={{
              "text-field": ["concat", ["get", "name"], "\n", ["to-string", ["get", "capacity_mw"]], " MW"],
              "text-size": 10,
              "text-offset": [0, 2],
              "text-anchor": "top",
              "text-line-height": 1.3,
            }}
            paint={{
              "text-color": "#92400E",
              "text-halo-color": "#FFFFFF",
              "text-halo-width": 1.5,
            }}
            minzoom={9}
          />
        </Source>
      )}

      {/* Construction Works - SVG Icons */}
      {layers.construction_works && iconsLoaded && (
        <Source id="construction" type="geojson" data={constructionGeoJSON}>
          <Layer
            id="construction-symbols"
            type="symbol"
            layout={{
              "icon-image": "icon-construction",
              "icon-size": 0.55,
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
            }}
          />
          <Layer
            id="construction-labels"
            type="symbol"
            layout={{
              "text-field": ["concat", ["get", "name"], "\n", ["to-string", ["get", "progress_pct"]], "%"],
              "text-size": 10,
              "text-offset": [0, 1.8],
              "text-anchor": "top",
              "text-line-height": 1.3,
            }}
            paint={{
              "text-color": "#9A3412",
              "text-halo-color": "#FFFFFF",
              "text-halo-width": 1.5,
            }}
            minzoom={9}
          />
        </Source>
      )}

      {popupInfo && (
        <Popup
          latitude={popupInfo.lat}
          longitude={popupInfo.lng}
          onClose={() => setPopupInfo(null)}
          closeOnClick={false}
          className="sabesp-popup"
          maxWidth="340px"
        >
          {popupInfo.content}
        </Popup>
      )}
    </Map>
  );
}

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

interface MapViewProps {
  layers: LayerVisibility;
  choroplethMetric: ChoroplethMetric;
  searchQuery: string;
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
  searchQuery,
  is3D,
  onSelectReservoir,
  flyToReservoirId,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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

  useEffect(() => {
    if (searchQuery && mapRef.current) {
      const q = searchQuery.toLowerCase();
      const eta = etas.find(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.municipality.toLowerCase().includes(q)
      );
      if (eta) {
        mapRef.current.flyTo({ center: [eta.lng, eta.lat], zoom: 14, duration: 1500 });
        return;
      }
      const ete = etes.find(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.municipality.toLowerCase().includes(q)
      );
      if (ete) {
        mapRef.current.flyTo({ center: [ete.lng, ete.lat], zoom: 14, duration: 1500 });
        return;
      }
      const res = reservoirs.find((r) => r.name.toLowerCase().includes(q));
      if (res) {
        mapRef.current.flyTo({ center: [res.lng, res.lat], zoom: 11, duration: 1500 });
        return;
      }
      const pp = powerPlants.find(
        (p) => p.name.toLowerCase().includes(q)
      );
      if (pp) {
        mapRef.current.flyTo({ center: [pp.lng, pp.lat], zoom: 14, duration: 1500 });
      }
    }
  }, [searchQuery]);

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
                <span className="text-gray-500">Consumo água</span>
                <span className="font-medium">{(Number(props.water_consumption_m3) / 1_000_000).toFixed(1)} M m³/mês</span>
                <span className="text-gray-500">Esgoto gerado</span>
                <span className="font-medium">{(Number(props.sewage_generation_m3) / 1_000_000).toFixed(1)} M m³/mês</span>
                <span className="text-gray-500">Coleta</span>
                <span className="font-medium">{props.sewage_collection_pct}%</span>
                <span className="text-gray-500">Tratamento</span>
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
        "eta-circles",
        "ete-circles",
        "reservoir-circles",
        "region-fill",
        "power-plant-circles",
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

      {/* ETAs */}
      {layers.etas && (
        <Source id="etas" type="geojson" data={etaGeoJSON}>
          <Layer
            id="eta-circles"
            type="circle"
            paint={{
              "circle-radius": ["interpolate", ["linear"], ["get", "capacity"], 0.35, 6, 33, 20],
              "circle-color": SABESP.blue,
              "circle-stroke-color": "#FFFFFF",
              "circle-stroke-width": 2,
              "circle-opacity": 0.9,
            }}
          />
          <Layer
            id="eta-labels"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-size": 11,
              "text-offset": [0, 1.5],
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

      {/* ETEs */}
      {layers.etes && (
        <Source id="etes" type="geojson" data={eteGeoJSON}>
          <Layer
            id="ete-circles"
            type="circle"
            paint={{
              "circle-radius": ["interpolate", ["linear"], ["get", "capacity"], 0.3, 6, 12, 18],
              "circle-color": "#D97706",
              "circle-stroke-color": "#FFFFFF",
              "circle-stroke-width": 2,
              "circle-opacity": 0.9,
            }}
          />
          <Layer
            id="ete-labels"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-size": 11,
              "text-offset": [0, 1.5],
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

      {/* Reservoirs */}
      {layers.reservoirs && (
        <Source id="reservoirs" type="geojson" data={reservoirGeoJSON}>
          <Layer
            id="reservoir-circles"
            type="circle"
            paint={{
              "circle-radius": 16,
              "circle-color": ["get", "color"],
              "circle-stroke-color": "#FFFFFF",
              "circle-stroke-width": 3,
              "circle-opacity": 0.9,
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
              "text-offset": [0, 2.5],
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

      {/* Power Plants */}
      {layers.power_plants && (
        <Source id="power-plants" type="geojson" data={powerPlantGeoJSON}>
          <Layer
            id="power-plant-circles"
            type="circle"
            paint={{
              "circle-radius": [
                "case",
                ["==", ["get", "pp_type"], "hydroelectric"], 12,
                8,
              ],
              "circle-color": [
                "case",
                ["==", ["get", "pp_type"], "hydroelectric"], "#F59E0B",
                "#10B981",
              ],
              "circle-stroke-color": "#FFFFFF",
              "circle-stroke-width": 2,
              "circle-opacity": 0.9,
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

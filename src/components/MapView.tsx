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
import {
  LayerVisibility,
  ChoroplethMetric,
  ETA,
  ETE,
  Reservoir,
} from "@/types";
import {
  getLevelColor,
  getEfficiencyColor,
  choroplethColor,
} from "@/lib/utils";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const SP_CENTER = { latitude: -23.2, longitude: -47.0, zoom: 7 };

interface MapViewProps {
  layers: LayerVisibility;
  choroplethMetric: ChoroplethMetric;
  searchQuery: string;
  is3D: boolean;
  onSelectReservoir: (id: string | null) => void;
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
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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
        mapRef.current.flyTo({
          center: [eta.lng, eta.lat],
          zoom: 12,
          duration: 1500,
        });
        return;
      }
      const ete = etes.find(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.municipality.toLowerCase().includes(q)
      );
      if (ete) {
        mapRef.current.flyTo({
          center: [ete.lng, ete.lat],
          zoom: 12,
          duration: 1500,
        });
        return;
      }
      const res = reservoirs.find((r) => r.name.toLowerCase().includes(q));
      if (res) {
        mapRef.current.flyTo({
          center: [res.lng, res.lat],
          zoom: 11,
          duration: 1500,
        });
      }
    }
  }, [searchQuery]);

  const etaGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: etas.map((e) => ({
      type: "Feature" as const,
      properties: {
        id: e.id,
        name: e.name,
        capacity: e.capacity_ls,
        volume: e.volume_treated_m3_month,
        municipality: e.municipality,
        system: e.system,
        type: "eta",
      },
      geometry: {
        type: "Point" as const,
        coordinates: [e.lng, e.lat],
      },
    })),
  };

  const eteGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: etes.map((e) => ({
      type: "Feature" as const,
      properties: {
        id: e.id,
        name: e.name,
        capacity: e.capacity_ls,
        treatment_pct: e.treatment_pct,
        municipality: e.municipality,
        system: e.system,
        type: "ete",
      },
      geometry: {
        type: "Point" as const,
        coordinates: [e.lng, e.lat],
      },
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
        type: "reservoir",
      },
      geometry: {
        type: "Point" as const,
        coordinates: [r.lng, r.lat],
      },
    })),
  };

  const waterPipelines = pipelines.filter((p) => p.type === "water");
  const sewagePipelines = pipelines.filter((p) => p.type === "sewage");

  const waterPipeGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: waterPipelines.map((p) => ({
      type: "Feature" as const,
      properties: {
        id: p.id,
        name: p.name,
        diameter: p.diameter_mm,
        type: "water",
      },
      geometry: {
        type: "LineString" as const,
        coordinates: p.coordinates,
      },
    })),
  };

  const sewagePipeGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: sewagePipelines.map((p) => ({
      type: "Feature" as const,
      properties: {
        id: p.id,
        name: p.name,
        diameter: p.diameter_mm,
        type: "sewage",
      },
      geometry: {
        type: "LineString" as const,
        coordinates: p.coordinates,
      },
    })),
  };

  const metricValues = regions.map(
    (r) => r[choroplethMetric] as number
  );
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
        color: choroplethColor(
          r[choroplethMetric] as number,
          minVal,
          maxVal,
          isPct
        ),
        water_consumption_m3: r.water_consumption_m3,
        sewage_generation_m3: r.sewage_generation_m3,
        sewage_collection_pct: r.sewage_collection_pct,
        sewage_treatment_pct: r.sewage_treatment_pct,
        population: r.population,
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: r.coordinates,
      },
    })),
  };

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
            <div className="text-sm">
              <h3 className="font-bold text-blue-300">{props.name}</h3>
              <p>Município: {props.municipality}</p>
              <p>Sistema: {props.system}</p>
              <p>Capacidade: {Number(props.capacity).toLocaleString()} L/s</p>
              <p>
                Volume tratado:{" "}
                {(Number(props.volume) / 1_000_000).toFixed(1)} M m³/mês
              </p>
            </div>
          ),
        });
      } else if (props.type === "ete") {
        setPopupInfo({
          lat: coords.lat,
          lng: coords.lng,
          content: (
            <div className="text-sm">
              <h3 className="font-bold text-orange-300">{props.name}</h3>
              <p>Município: {props.municipality}</p>
              <p>Sistema: {props.system}</p>
              <p>Capacidade: {Number(props.capacity).toLocaleString()} L/s</p>
              <p>Eficiência: {props.treatment_pct}%</p>
            </div>
          ),
        });
      } else if (props.type === "reservoir") {
        onSelectReservoir(props.id);
        setPopupInfo({
          lat: coords.lat,
          lng: coords.lng,
          content: (
            <div className="text-sm">
              <h3 className="font-bold text-cyan-300">{props.name}</h3>
              <p>Volume total: {props.total_volume} hm³</p>
              <p>
                Nível atual:{" "}
                <span style={{ color: props.color }}>
                  {props.current_level}%
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Clique no painel para ver previsão
              </p>
            </div>
          ),
        });
      } else if (props.name && props.population) {
        setPopupInfo({
          lat: coords.lat,
          lng: coords.lng,
          content: (
            <div className="text-sm">
              <h3 className="font-bold text-green-300">{props.name}</h3>
              <p>
                Pop.: {Number(props.population).toLocaleString()}
              </p>
              <p>
                Consumo água:{" "}
                {(Number(props.water_consumption_m3) / 1_000_000).toFixed(1)} M
                m³/mês
              </p>
              <p>
                Esgoto gerado:{" "}
                {(Number(props.sewage_generation_m3) / 1_000_000).toFixed(1)} M
                m³/mês
              </p>
              <p>Coleta: {props.sewage_collection_pct}%</p>
              <p>Tratamento: {props.sewage_treatment_pct}%</p>
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
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      interactiveLayerIds={[
        "eta-circles",
        "ete-circles",
        "reservoir-circles",
        "region-fill",
      ]}
      onClick={handleClick}
      onLoad={() => setMapLoaded(true)}
      terrain={is3D ? { source: "mapbox-dem", exaggeration: 1.5 } : undefined}
    >
      <NavigationControl position="top-right" />

      {is3D && mapLoaded && (
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        >
          <Layer id="sky-layer" type="sky" paint={{
            "sky-type": "atmosphere",
            "sky-atmosphere-sun": [0, 0],
            "sky-atmosphere-sun-intensity": 15,
          }} />
        </Source>
      )}

      {/* Choropleth Regions */}
      {layers.choropleth && (
        <Source id="regions" type="geojson" data={regionGeoJSON}>
          <Layer
            id="region-fill"
            type="fill"
            paint={{
              "fill-color": ["get", "color"],
              "fill-opacity": 0.35,
            }}
          />
          <Layer
            id="region-outline"
            type="line"
            paint={{
              "line-color": "#94a3b8",
              "line-width": 1,
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
              "text-color": "#e2e8f0",
              "text-halo-color": "#0f172a",
              "text-halo-width": 1,
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
              "line-color": "#3b82f6",
              "line-width": [
                "interpolate",
                ["linear"],
                ["get", "diameter"],
                800,
                2,
                3600,
                6,
              ],
              "line-opacity": 0.8,
            }}
            layout={{
              "line-cap": "round",
              "line-join": "round",
            }}
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
              "line-color": "#a855f7",
              "line-width": [
                "interpolate",
                ["linear"],
                ["get", "diameter"],
                800,
                2,
                2500,
                5,
              ],
              "line-opacity": 0.8,
              "line-dasharray": [3, 2],
            }}
            layout={{
              "line-cap": "round",
              "line-join": "round",
            }}
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
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "capacity"],
                350,
                6,
                33000,
                18,
              ],
              "circle-color": "#3b82f6",
              "circle-stroke-color": "#93c5fd",
              "circle-stroke-width": 2,
              "circle-opacity": 0.85,
            }}
          />
          <Layer
            id="eta-labels"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-size": 10,
              "text-offset": [0, 1.5],
              "text-anchor": "top",
            }}
            paint={{
              "text-color": "#93c5fd",
              "text-halo-color": "#0f172a",
              "text-halo-width": 1,
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
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "capacity"],
                300,
                6,
                12000,
                16,
              ],
              "circle-color": "#f97316",
              "circle-stroke-color": "#fdba74",
              "circle-stroke-width": 2,
              "circle-opacity": 0.85,
            }}
          />
          <Layer
            id="ete-labels"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-size": 10,
              "text-offset": [0, 1.5],
              "text-anchor": "top",
            }}
            paint={{
              "text-color": "#fdba74",
              "text-halo-color": "#0f172a",
              "text-halo-width": 1,
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
              "circle-radius": 14,
              "circle-color": ["get", "color"],
              "circle-stroke-color": "#e2e8f0",
              "circle-stroke-width": 2.5,
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
              "text-offset": [0, 2.2],
              "text-anchor": "top",
              "text-line-height": 1.3,
            }}
            paint={{
              "text-color": "#e2e8f0",
              "text-halo-color": "#0f172a",
              "text-halo-width": 1,
            }}
            minzoom={8}
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
          maxWidth="300px"
        >
          {popupInfo.content}
        </Popup>
      )}
    </Map>
  );
}

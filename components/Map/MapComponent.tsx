import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, GeoJSON, ZoomControl, Polygon, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { GeoPoint, MapLayer, TileProvider } from '../../types';

// Fix for default Leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  layers: MapLayer[];
  searchResults: GeoPoint[];
  tileProvider: TileProvider;
  onMoveEnd: (center: { lat: number; lng: number }, bounds: any, zoom: number) => void;
  drawMode: boolean;
  drawPoints: [number, number][];
  onMapClick: (latlng: { lat: number, lng: number }) => void;
  analysisPolygon: [number, number][] | null;
}

const MapController: React.FC<{ center: [number, number]; zoom: number; onMoveEnd: any }> = ({ center, zoom, onMoveEnd }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  useMapEvents({
    moveend: () => {
      onMoveEnd(map.getCenter(), map.getBounds(), map.getZoom());
    },
  });

  return null;
};

const MapEvents: React.FC<{ isDrawing: boolean; onClick: (e: any) => void }> = ({ isDrawing, onClick }) => {
  useMapEvents({
    click: (e) => {
      if (isDrawing) {
        onClick(e.latlng);
      }
    }
  });
  return null;
};

// Internal Component for handling Leaflet.heat functionality
const HeatmapLayer: React.FC<{ data: any[] }> = ({ data }) => {
  const map = useMap();
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // 1. Shim global L for the legacy plugin to use
    if (!(window as any).L) {
      (window as any).L = L;
    }

    const initHeatmap = () => {
       // Check both imported L and window.L
       const heatFn = (L as any).heatLayer || (window as any).L?.heatLayer;

       if (heatFn) {
            // Clean up existing layer
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }

            const heat = heatFn(data, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                max: 1.0,
                gradient: {
                    0.4: 'blue',
                    0.6: 'cyan',
                    0.7: 'lime',
                    0.8: 'yellow',
                    1.0: 'red'
                }
            });

            heat.addTo(map);
            layerRef.current = heat;
       } else {
           console.error("Leaflet heat plugin failed to load function.");
       }
    };

    // 2. Dynamically load the script if heatLayer is missing
    if (!(L as any).heatLayer && !(window as any).L?.heatLayer) {
        const script = document.createElement('script');
        script.src = "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js";
        script.async = true;
        script.onload = () => {
            initHeatmap();
        };
        document.body.appendChild(script);
    } else {
        // Already loaded
        initHeatmap();
    }

    return () => {
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
            layerRef.current = null;
        }
    };
  }, [map, data]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ 
  center, 
  zoom, 
  layers, 
  searchResults, 
  tileProvider,
  onMoveEnd,
  drawMode,
  drawPoints,
  onMapClick,
  analysisPolygon
}) => {
  
  const getTileUrl = (provider: TileProvider) => {
    switch (provider) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      case 'terrain':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      case 'osm':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getAttribution = (provider: TileProvider) => {
    switch (provider) {
      case 'satellite':
      case 'terrain':
        return 'Esri, HERE, Garmin, FAO, USGS';
      case 'dark':
        return '&copy; OpenStreetMap &copy; CARTO';
      default:
        return '&copy; OpenStreetMap contributors';
    }
  };

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={true} 
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution={getAttribution(tileProvider)}
        url={getTileUrl(tileProvider)}
      />
      
      <MapController center={center} zoom={zoom} onMoveEnd={onMoveEnd} />
      <MapEvents isDrawing={drawMode} onClick={onMapClick} />

      {/* Drawing UI */}
      {drawPoints.length > 0 && (
        <>
          <Polyline positions={drawPoints} pathOptions={{ color: '#f59e0b', dashArray: '10, 10' }} />
          {drawPoints.map((p, i) => (
            <Marker 
                key={`draw-pt-${i}`} 
                position={p} 
                icon={L.divIcon({
                    className: 'bg-amber-500 rounded-full border-2 border-white shadow-sm',
                    iconSize: [10, 10]
                })} 
            />
          ))}
        </>
      )}

      {/* Completed Polygon */}
      {analysisPolygon && (
        <Polygon 
            positions={analysisPolygon} 
            pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.2 }} 
        />
      )}

      {/* Render Search Results */}
      {searchResults.map((point, idx) => (
        <Marker key={`search-${idx}`} position={[point.lat, point.lng]}>
          <Popup>
            <div className="text-slate-800">
              <h3 className="font-bold">{point.title || point.name || "Unknown Location"}</h3>
              <p>{point.description}</p>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {point.category || "Place"}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Render Active Layers - Reversed to allow top of list to be top of stack */}
      {[...layers].reverse().filter(l => l.visible).map((layer) => {
        if (layer.type === 'geojson' && layer.data) {
          return (
            <GeoJSON 
              key={layer.id} 
              data={layer.data} 
              style={() => ({
                color: layer.color || '#3b82f6',
                weight: 2,
                fillOpacity: 0.2
              })}
            />
          );
        }
        if (layer.type === 'heatmap' && layer.data) {
           return (
               <HeatmapLayer key={layer.id} data={layer.data} />
           );
        }
        return null;
      })}
    </MapContainer>
  );
};

export default MapComponent;
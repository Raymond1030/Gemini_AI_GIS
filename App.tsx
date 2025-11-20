import React, { useState, useCallback } from 'react';
import MapComponent from './components/Map/MapComponent';
import Sidebar from './components/Sidebar/Sidebar';
import { GeoPoint, MapLayer, TileProvider, AnalysisResult } from './types';
import { searchPlacesWithGemini, generateLayerWithGemini, analyzeMapArea, performSpatialQuery, performDensityAnalysis } from './services/geminiService';

const App: React.FC = () => {
  // Map State
  const [center, setCenter] = useState<[number, number]>([40.7128, -74.0060]); // NYC Default
  const [zoom, setZoom] = useState<number>(13);
  const [bounds, setBounds] = useState<any>(null);
  
  // Drawing & Analysis State
  const [drawMode, setDrawMode] = useState(false);
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const [analysisPolygon, setAnalysisPolygon] = useState<[number, number][] | null>(null);

  // Data State
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [searchResults, setSearchResults] = useState<GeoPoint[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  
  // UI State
  const [tileProvider, setTileProvider] = useState<TileProvider>('dark');
  const [searchLoading, setSearchLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const handleMoveEnd = useCallback((newCenter: { lat: number, lng: number }, newBounds: any, newZoom: number) => {
    setBounds(newBounds);
  }, []);

  // -- Interactions --

  // Geocoding & General Search
  const handleSearch = async (query: string) => {
    setSearchLoading(true);
    // Use current map center for context
    const currentCenter = bounds ? bounds.getCenter() : { lat: center[0], lng: center[1] };
    
    const result = await searchPlacesWithGemini(query, currentCenter);
    
    if (result.locations.length > 0) {
      setSearchResults(result.locations);
      // Fly to first result
      setCenter([result.locations[0].lat, result.locations[0].lng]);
      setZoom(15); // Zoom in for address lookup
    }
    setSearchLoading(false);
  };

  const handleGenerateLayer = async (prompt: string) => {
    setSearchLoading(true);
    const currentCenter = bounds ? bounds.getCenter() : { lat: center[0], lng: center[1] };
    
    const geoJsonData = await generateLayerWithGemini(prompt, currentCenter);
    
    if (geoJsonData) {
      const newLayer: MapLayer = {
        id: Date.now().toString(),
        name: prompt.slice(0, 20) + (prompt.length > 20 ? '...' : ''),
        visible: true,
        type: 'geojson',
        data: geoJsonData,
        color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
      };
      setLayers(prev => [newLayer, ...prev]); // Add to top
    }
    setSearchLoading(false);
  };

  const handleAnalyze = async () => {
    if (!bounds) return;
    setAnalysisLoading(true);
    const result = await analyzeMapArea(bounds);
    if (result) {
      setAnalysisData(result);
    }
    setAnalysisLoading(false);
  };

  // -- Spatial Query Logic --
  const startDrawing = () => {
      setDrawMode(true);
      setDrawPoints([]);
      setAnalysisPolygon(null);
  };

  const handleMapClick = (latlng: { lat: number, lng: number }) => {
      if (drawMode) {
          // Check if closing polygon (close to start)
          if (drawPoints.length > 2) {
              const start = drawPoints[0];
              const dist = Math.sqrt(Math.pow(start[0] - latlng.lat, 2) + Math.pow(start[1] - latlng.lng, 2));
              if (dist < 0.005) { // Close threshold
                  setAnalysisPolygon(drawPoints);
                  setDrawMode(false);
                  setDrawPoints([]);
                  return;
              }
          }
          setDrawPoints(prev => [...prev, [latlng.lat, latlng.lng]]);
      }
  };

  const resetDrawing = () => {
      setDrawMode(false);
      setDrawPoints([]);
      setAnalysisPolygon(null);
  };

  const handleSpatialQuery = async (query: string) => {
      if (!analysisPolygon) return;
      setAnalysisLoading(true);
      
      const points = await performSpatialQuery(query, analysisPolygon);
      
      if (points.length > 0) {
          setSearchResults(points); // Reuse search markers for now
      }
      setAnalysisLoading(false);
  };

  // -- Density Analysis Logic --
  const handleDensityAnalysis = async (topic: string) => {
      if (!bounds) return;
      setAnalysisLoading(true);

      const points = await performDensityAnalysis(topic, bounds);
      
      if (points.length > 0) {
          const newLayer: MapLayer = {
              id: Date.now().toString(),
              name: `Density: ${topic}`,
              visible: true,
              type: 'heatmap',
              data: points,
          };
          setLayers(prev => [newLayer, ...prev]);
      }
      
      setAnalysisLoading(false);
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      <Sidebar 
        layers={layers} 
        setLayers={setLayers}
        tileProvider={tileProvider}
        setTileProvider={setTileProvider}
        onChatSearch={handleSearch}
        onGenerateLayer={handleGenerateLayer}
        analysisData={analysisData}
        onAnalyzeRequest={handleAnalyze}
        isAnalyzing={analysisLoading}
        searchLoading={searchLoading}
        
        // Drawing Props
        isDrawing={drawMode}
        startDrawing={startDrawing}
        resetDrawing={resetDrawing}
        polygonDefined={!!analysisPolygon}
        onSpatialQuery={handleSpatialQuery}
        
        // Density Props
        onDensityAnalysis={handleDensityAnalysis}
      />
      
      <MapComponent 
        center={center}
        zoom={zoom}
        layers={layers}
        searchResults={searchResults}
        tileProvider={tileProvider}
        onMoveEnd={handleMoveEnd}
        drawMode={drawMode}
        drawPoints={drawPoints}
        onMapClick={handleMapClick}
        analysisPolygon={analysisPolygon}
      />
    </div>
  );
};

export default App;
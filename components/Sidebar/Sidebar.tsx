import React, { useState } from 'react';
import { MapLayer, TileProvider, AnalysisResult } from '../../types';
import { Layers, Map as MapIcon, MessageSquare, Activity, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import ChatInterface from './ChatInterface';
import LayerControl from './LayerControl';
import AnalyticsPanel from '../Analytics/AnalyticsPanel';

interface SidebarProps {
  layers: MapLayer[];
  setLayers: React.Dispatch<React.SetStateAction<MapLayer[]>>;
  tileProvider: TileProvider;
  setTileProvider: (t: TileProvider) => void;
  onChatSearch: (query: string) => void;
  onGenerateLayer: (prompt: string) => void;
  analysisData: AnalysisResult | null;
  onAnalyzeRequest: () => void;
  isAnalyzing: boolean;
  searchLoading: boolean;

  // Drawing/Spatial Props
  isDrawing: boolean;
  startDrawing: () => void;
  resetDrawing: () => void;
  polygonDefined: boolean;
  onSpatialQuery: (query: string) => void;
  
  // New
  onDensityAnalysis: (topic: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  layers,
  setLayers,
  tileProvider,
  setTileProvider,
  onChatSearch,
  onGenerateLayer,
  analysisData,
  onAnalyzeRequest,
  isAnalyzing,
  searchLoading,
  isDrawing,
  startDrawing,
  resetDrawing,
  polygonDefined,
  onSpatialQuery,
  onDensityAnalysis
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'layers' | 'analysis'>('chat');

  if (!isOpen) {
    return (
      <div className="absolute left-4 top-4 z-[1000]">
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg shadow-lg border border-slate-700 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-0 h-full w-96 bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 z-[1000] flex flex-col shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-400">
          <MapIcon size={24} />
          <h1 className="text-xl font-bold text-white tracking-tight">NeuroMap GIS</h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-sm font-medium flex justify-center gap-2 transition-colors ${
            activeTab === 'chat' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare size={16} /> AI Chat
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-3 text-sm font-medium flex justify-center gap-2 transition-colors ${
            activeTab === 'layers' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers size={16} /> Layers
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 py-3 text-sm font-medium flex justify-center gap-2 transition-colors ${
            activeTab === 'analysis' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity size={16} /> Analysis
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        
        {activeTab === 'chat' && (
          <ChatInterface 
            onSearch={onChatSearch} 
            onGenerate={onGenerateLayer}
            loading={searchLoading}
          />
        )}

        {activeTab === 'layers' && (
          <LayerControl 
            layers={layers} 
            setLayers={setLayers}
            tileProvider={tileProvider}
            setTileProvider={setTileProvider}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalyticsPanel 
            data={analysisData} 
            onRequestAnalysis={onAnalyzeRequest}
            loading={isAnalyzing}
            isDrawing={isDrawing}
            startDrawing={startDrawing}
            resetDrawing={resetDrawing}
            polygonDefined={polygonDefined}
            onSpatialQuery={onSpatialQuery}
            onDensityAnalysis={onDensityAnalysis}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
        <span>v1.2.0</span>
        <span>Powered by Gemini 2.5</span>
      </div>
    </div>
  );
};

export default Sidebar;
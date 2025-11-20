import React from 'react';
import { MapLayer, TileProvider } from '../../types';
import { Eye, EyeOff, Trash2, Map as IconMap, Satellite, Moon, Mountain, ChevronUp, ChevronDown } from 'lucide-react';

interface LayerControlProps {
  layers: MapLayer[];
  setLayers: React.Dispatch<React.SetStateAction<MapLayer[]>>;
  tileProvider: TileProvider;
  setTileProvider: (t: TileProvider) => void;
}

const LayerControl: React.FC<LayerControlProps> = ({ layers, setLayers, tileProvider, setTileProvider }) => {
  
  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const removeLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
  };

  const moveLayer = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === layers.length - 1) return;
    
    const newLayers = [...layers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newLayers[targetIndex];
    newLayers[targetIndex] = newLayers[index];
    newLayers[index] = temp;
    setLayers(newLayers);
  };

  return (
    <div className="space-y-6">
      {/* Base Map Selection */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Base Map</h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setTileProvider('osm')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
              tileProvider === 'osm' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
            }`}
          >
            <IconMap size={18} className="mb-1" />
            <span className="text-[9px] font-medium">Vector</span>
          </button>
          <button
            onClick={() => setTileProvider('satellite')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
              tileProvider === 'satellite' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
            }`}
          >
            <Satellite size={18} className="mb-1" />
            <span className="text-[9px] font-medium">Satellite</span>
          </button>
          <button
            onClick={() => setTileProvider('terrain')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
              tileProvider === 'terrain' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
            }`}
          >
            <Mountain size={18} className="mb-1" />
            <span className="text-[9px] font-medium">Terrain</span>
          </button>
          <button
            onClick={() => setTileProvider('dark')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
              tileProvider === 'dark' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
            }`}
          >
            <Moon size={18} className="mb-1" />
            <span className="text-[9px] font-medium">Dark</span>
          </button>
        </div>
      </div>

      {/* Overlay Layers */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Layer Stack</h3>
        {layers.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-500 text-sm">No custom layers</p>
            <p className="text-slate-600 text-xs mt-1">Use AI Chat to generate layers</p>
          </div>
        ) : (
          <div className="space-y-2">
            {layers.map((layer, index) => (
              <div key={layer.id} className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 group hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: layer.color || '#ccc' }} />
                    <span className="text-sm font-medium text-slate-200 truncate max-w-[120px]">{layer.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => toggleLayer(layer.id)}
                      className={`p-1.5 rounded-md transition-colors ${layer.visible ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-400'}`}
                      title="Toggle Visibility"
                    >
                      {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button 
                      onClick={() => removeLayer(layer.id)}
                      className="p-1.5 text-red-500/50 hover:text-red-400 rounded-md hover:bg-red-500/10 transition-colors"
                      title="Remove Layer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {/* Ordering Controls */}
                <div className="flex border-t border-slate-700 bg-slate-900/30">
                   <button 
                     disabled={index === 0}
                     onClick={() => moveLayer(index, 'up')}
                     className="flex-1 py-1 flex justify-center items-center hover:bg-slate-700/50 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400"
                     title="Move Up (Front)"
                   >
                     <ChevronUp size={14} />
                   </button>
                   <div className="w-px bg-slate-700"></div>
                   <button 
                     disabled={index === layers.length - 1}
                     onClick={() => moveLayer(index, 'down')}
                     className="flex-1 py-1 flex justify-center items-center hover:bg-slate-700/50 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400"
                     title="Move Down (Back)"
                   >
                     <ChevronDown size={14} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LayerControl;
import React, { useState } from 'react';
import { AnalysisResult } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RefreshCw, FileText, PenTool, Search, XCircle, Flame } from 'lucide-react';

interface AnalyticsPanelProps {
  data: AnalysisResult | null;
  onRequestAnalysis: () => void;
  loading: boolean;
  
  // Drawing Props
  isDrawing: boolean;
  startDrawing: () => void;
  resetDrawing: () => void;
  polygonDefined: boolean;
  onSpatialQuery: (query: string) => void;
  
  // Density Props
  onDensityAnalysis: (topic: string) => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ 
    data, 
    onRequestAnalysis, 
    loading,
    isDrawing,
    startDrawing,
    resetDrawing,
    polygonDefined,
    onSpatialQuery,
    onDensityAnalysis
}) => {
  
  const [spatialQueryText, setSpatialQueryText] = useState('');
  const [densityTopic, setDensityTopic] = useState('');

  const handleSpatialSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(spatialQueryText.trim()) onSpatialQuery(spatialQueryText);
  }

  const handleDensitySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (densityTopic.trim()) {
          onDensityAnalysis(densityTopic);
          setDensityTopic('');
      }
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* Spatial Query Module */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
            <PenTool size={18} className="text-amber-500" />
            <h3 className="font-bold text-white text-sm">Spatial Query</h3>
        </div>
        
        {!polygonDefined && !isDrawing && (
            <button 
                onClick={startDrawing}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium border border-slate-600 border-dashed hover:border-slate-500 transition-all"
            >
                Draw Search Area (Polygon)
            </button>
        )}

        {isDrawing && (
            <div className="text-center py-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <p className="text-amber-400 text-xs font-medium">Click map to add points</p>
                <button onClick={resetDrawing} className="text-[10px] text-slate-400 hover:text-white mt-1 underline">Cancel</button>
            </div>
        )}

        {polygonDefined && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
                    <span className="text-xs text-amber-400 font-medium">Area Defined</span>
                    <button onClick={resetDrawing} className="text-slate-400 hover:text-red-400"><XCircle size={14}/></button>
                </div>
                
                <form onSubmit={handleSpatialSubmit} className="flex gap-2">
                    <input 
                        type="text" 
                        value={spatialQueryText}
                        onChange={(e) => setSpatialQueryText(e.target.value)}
                        placeholder="Find hospitals, schools..."
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-500 text-white p-1.5 rounded-lg disabled:opacity-50">
                        <Search size={14} />
                    </button>
                </form>
            </div>
        )}
      </div>

      {/* Kernel Density Analysis */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
         <div className="flex items-center gap-2 mb-3">
            <Flame size={18} className="text-red-500" />
            <h3 className="font-bold text-white text-sm">Kernel Density (Heatmap)</h3>
         </div>
         <p className="text-xs text-slate-400 mb-3">Generate a heatmap visualization based on a specific phenomenon.</p>
         <form onSubmit={handleDensitySubmit} className="flex gap-2">
             <input 
                 type="text" 
                 value={densityTopic}
                 onChange={(e) => setDensityTopic(e.target.value)}
                 placeholder="e.g. Traffic intensity, Air pollution"
                 className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
             />
             <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-lg disabled:opacity-50">
                 <Search size={14} />
             </button>
         </form>
      </div>

      {/* General View Analysis */}
      <div className="border-t border-slate-800 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-300 text-sm">Viewport Analysis</h3>
            <button
                onClick={onRequestAnalysis}
                disabled={loading}
                className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all disabled:opacity-50 border border-blue-600/30"
            >
                {loading ? <RefreshCw className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                Analyze View
            </button>
          </div>

          {!data ? (
             <div className="text-center py-4">
                <p className="text-slate-500 text-xs italic">No analysis data for current view.</p>
             </div>
          ) : (
            <div className="space-y-4">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <h4 className="text-sm font-bold text-white mb-1">{data.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{data.summary}</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {data.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-slate-800 p-2 rounded border border-slate-700">
                        <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider mb-0.5">{metric.label}</p>
                        <p className="text-white text-sm font-semibold">
                        {metric.value.toLocaleString()}
                        {metric.unit && <span className="text-[10px] text-slate-400 font-normal ml-1">{metric.unit}</span>}
                        </p>
                    </div>
                    ))}
                </div>

                {/* Chart */}
                {data.chartData && (
                    <div className="h-48 bg-slate-800 rounded-lg border border-slate-700 p-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Distribution</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={data.chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={55}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px' }} 
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                )}
            </div>
          )}
      </div>
    </div>
  );
};

export default AnalyticsPanel;
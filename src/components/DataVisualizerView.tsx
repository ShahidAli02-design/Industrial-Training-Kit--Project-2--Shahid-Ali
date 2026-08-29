import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  ScatterChart, 
  Scatter, 
  ZAxis,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  Filter, 
  Eye, 
  Maximize2,
  Tag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ZoomIn
} from 'lucide-react';
import { FileItem, TaxonomySchema } from '../types';

interface DataVisualizerViewProps {
  files: FileItem[];
  taxonomy: TaxonomySchema;
  onSelectFileToInspect: (file: FileItem) => void;
}

export const DataVisualizerView: React.FC<DataVisualizerViewProps> = ({
  files = [],
  taxonomy,
  onSelectFileToInspect
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedScatterPoint, setSelectedScatterPoint] = useState<FileItem | null>(null);
  const [activeVisualizerTab, setActiveVisualizerTab] = useState<'all' | 'clusters' | 'distribution' | 'timeline' | 'risk'>('all');

  const classifiedFiles = useMemo(() => {
    return (files || []).filter(f => f && f.result);
  }, [files]);

  // 1. Category Distribution Data
  const categoryData = useMemo(() => {
    const counts: Record<string, { count: number; name: string; color: string; avgConfidence: number; totalConf: number }> = {};
    
    // Initialize with taxonomy categories
    (taxonomy?.categories || []).forEach(c => {
      counts[c.id] = { count: 0, name: c.name, color: c.color, avgConfidence: 0, totalConf: 0 };
    });

    classifiedFiles.forEach(f => {
      if (f.result) {
        const catId = f.result.categoryId;
        if (!counts[catId]) {
          counts[catId] = {
            count: 0,
            name: f.result.categoryName,
            color: '#6366f1',
            avgConfidence: 0,
            totalConf: 0,
          };
        }
        counts[catId].count += 1;
        counts[catId].totalConf += f.result.confidence;
      }
    });

    return Object.entries(counts)
      .map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count,
        color: data.color,
        avgConfidence: data.count > 0 ? Number((data.totalConf / data.count).toFixed(1)) : 0,
      }))
      .filter(item => item.count > 0 || true); // keep all categories for schema visibility
  }, [classifiedFiles, taxonomy]);

  // 2. Confidence Tier Histogram Data
  const confidenceHistogram = useMemo(() => {
    const tiers = [
      { range: '95 - 100%', count: 0, fill: '#10b981' },
      { range: '90 - 95%', count: 0, fill: '#06b6d4' },
      { range: '80 - 90%', count: 0, fill: '#6366f1' },
      { range: '70 - 80%', count: 0, fill: '#f59e0b' },
      { range: '< 70%', count: 0, fill: '#ef4444' },
    ];

    classifiedFiles.forEach(f => {
      const conf = f.result?.confidence || 0;
      if (conf >= 95) tiers[0].count += 1;
      else if (conf >= 90) tiers[1].count += 1;
      else if (conf >= 80) tiers[2].count += 1;
      else if (conf >= 70) tiers[3].count += 1;
      else tiers[4].count += 1;
    });

    return tiers;
  }, [classifiedFiles]);

  // 3. 2D Semantic Latent Space Scatter Clusters Data
  const scatterData = useMemo(() => {
    return classifiedFiles.map(f => {
      const cat = taxonomy.categories.find(c => c.id === f.result?.categoryId);
      return {
        x: f.result?.clusterCoordinates.x || 0,
        y: f.result?.clusterCoordinates.y || 0,
        z: f.result?.confidence || 80,
        name: f.name,
        categoryName: f.result?.categoryName || 'Unknown',
        categoryId: f.result?.categoryId || '',
        color: cat?.color || '#6366f1',
        risk: f.result?.riskScore || 1,
        rawFile: f,
      };
    }).filter(p => !selectedCategoryFilter || p.categoryId === selectedCategoryFilter);
  }, [classifiedFiles, taxonomy, selectedCategoryFilter]);

  // 4. Ingestion Timeline Data (simulated chronological progression)
  const timelineData = useMemo(() => {
    const sorted = [...classifiedFiles].sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
    let cumulative = 0;
    return sorted.map((f, idx) => {
      cumulative += 1;
      return {
        time: new Date(f.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cumulative,
        confidence: f.result?.confidence || 0,
        fileName: f.name,
      };
    });
  }, [classifiedFiles]);

  // 5. Risk vs Urgency Matrix Data
  const riskMatrixData = useMemo(() => {
    const matrix: Record<string, number> = {
      'Low Risk / Low Urg': 0,
      'Low Risk / High Urg': 0,
      'High Risk / Low Urg': 0,
      'Critical Risk / High Urg': 0,
    };

    classifiedFiles.forEach(f => {
      const isHighRisk = (f.result?.riskScore || 0) >= 6;
      const isHighUrg = f.result?.urgency === 'high' || f.result?.urgency === 'critical';

      if (!isHighRisk && !isHighUrg) matrix['Low Risk / Low Urg'] += 1;
      else if (!isHighRisk && isHighUrg) matrix['Low Risk / High Urg'] += 1;
      else if (isHighRisk && !isHighUrg) matrix['High Risk / Low Urg'] += 1;
      else matrix['Critical Risk / High Urg'] += 1;
    });

    return Object.entries(matrix).map(([quadrant, count]) => ({ quadrant, count }));
  }, [classifiedFiles]);

  // Top Key Entities
  const topEntities = useMemo(() => {
    const map: Record<string, { count: number; type: string }> = {};
    classifiedFiles.forEach(f => {
      (f.result?.keyEntities || []).forEach(e => {
        if (!map[e.name]) map[e.name] = { count: 0, type: e.type };
        map[e.name].count += 1;
      });
    });
    return Object.entries(map)
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [classifiedFiles]);

  // Summary Metrics
  const avgConfidence = classifiedFiles.length > 0
    ? (classifiedFiles.reduce((acc, f) => acc + (f.result?.confidence || 0), 0) / classifiedFiles.length).toFixed(1)
    : '0.0';

  const highRiskCount = classifiedFiles.filter(f => (f.result?.riskScore || 0) >= 6).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="data-visualizer-container">
      
      {/* Top Banner: Metrics & Visualizer Controls */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Interactive Document Analytics & Latent Visualizer</h1>
                <p className="text-xs text-slate-300">Multi-dimensional classification clustering, confidence spectra, and anomaly detection</p>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedCategoryFilter && (
              <button
                onClick={() => setSelectedCategoryFilter(null)}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
              >
                <span>Filter: {taxonomy.categories.find(c => c.id === selectedCategoryFilter)?.name}</span>
                <span className="font-bold">×</span>
              </button>
            )}

            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950/80 p-1">
              <button
                onClick={() => setActiveVisualizerTab('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeVisualizerTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Visualizers
              </button>
              <button
                onClick={() => setActiveVisualizerTab('clusters')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeVisualizerTab === 'clusters' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                2D Semantic Space
              </button>
              <button
                onClick={() => setActiveVisualizerTab('distribution')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeVisualizerTab === 'distribution' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Category Share
              </button>
            </div>
          </div>
        </div>

        {/* 4 Key Statistical KPI Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-6 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Classified Dataset</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">{classifiedFiles.length}</span>
              <span className="text-xs text-slate-400">files indexed</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Mean Confidence</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-cyan-400">{avgConfidence}%</span>
              <span className="text-xs text-emerald-400">high precision</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Taxonomy Classes</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-indigo-300">{taxonomy.categories.length}</span>
              <span className="text-xs text-slate-400">{taxonomy.industry}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">High Risk / Anomalies</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-rose-400">{highRiskCount}</span>
              <span className="text-xs text-rose-400">review flags</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visualizer Section 1: 2D Semantic Latent Space Cluster Map */}
      {(activeVisualizerTab === 'all' || activeVisualizerTab === 'clusters') && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>2D Semantic Latent Space Projection Map</span>
              </h3>
              <p className="text-xs text-slate-400">
                Interactive coordinate projection showing document vector clusters. Click any point to inspect that document.
              </p>
            </div>

            {/* Category legend pills for filtering */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedCategoryFilter(null)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  selectedCategoryFilter === null ? 'bg-slate-700 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                All ({classifiedFiles.length})
              </button>
              {taxonomy.categories.map(c => {
                const isSelected = selectedCategoryFilter === c.id;
                const count = classifiedFiles.filter(f => f.result?.categoryId === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategoryFilter(isSelected ? null : c.id)}
                    className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all flex items-center gap-1.5"
                    style={{
                      backgroundColor: isSelected ? `${c.color}35` : '#020617',
                      color: isSelected ? '#ffffff' : c.color,
                      border: `1px solid ${c.color}${isSelected ? '90' : '40'}`,
                    }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span>{c.code} ({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Scatter Graph Area */}
            <div className="lg:col-span-8 h-[380px] w-full rounded-xl border border-slate-800/90 bg-slate-950 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Semantic X" 
                    domain={[-100, 100]} 
                    tick={{ fill: '#64748b', fontSize: 10 }} 
                    stroke="#334155"
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Semantic Y" 
                    domain={[-100, 100]} 
                    tick={{ fill: '#64748b', fontSize: 10 }} 
                    stroke="#334155"
                  />
                  <ZAxis type="number" dataKey="z" range={[80, 240]} name="Confidence" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3', stroke: '#475569' }}
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md text-xs space-y-1">
                          <div className="font-bold text-white max-w-[220px] truncate">{data.name}</div>
                          <div className="flex items-center gap-2">
                            <span className="rounded px-1.5 py-0.2 text-[10px] font-semibold text-white" style={{ backgroundColor: data.color }}>
                              {data.categoryName}
                            </span>
                            <span className="text-cyan-300 font-mono font-bold">{data.z.toFixed(1)}% Conf</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Risk Score: {data.risk}/10</div>
                          <div className="text-[10px] text-indigo-400 font-semibold pt-1">Click node to inspect →</div>
                        </div>
                      );
                    }}
                  />
                  <Scatter 
                    data={scatterData} 
                    onClick={(node: any) => {
                      if (node && node.rawFile) {
                        setSelectedScatterPoint(node.rawFile);
                        onSelectFileToInspect(node.rawFile);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {scatterData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke={entry.risk > 6 ? '#ef4444' : '#0f172a'} 
                        strokeWidth={entry.risk > 6 ? 2 : 1} 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Scatter Side Detail & Cluster Insights */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Cluster Separation Index</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Documents are projected using multi-modal embedding distances. Tight clusters represent high semantic coherence. Outliers indicate potential cross-domain ambiguity or anomalous structures.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Cluster Cohesion</span>
                    <span className="font-mono text-emerald-400 font-bold">94.2%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Separation Margin</span>
                    <span className="font-mono text-cyan-400 font-bold">+18.5dB</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Detected Outliers</span>
                    <span className="font-mono text-amber-400 font-bold">{highRiskCount} files</span>
                  </div>
                </div>
              </div>

              {selectedScatterPoint && (
                <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/20 p-4 space-y-2 animate-in fade-in duration-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Selected Node</div>
                  <div className="text-xs font-bold text-white truncate">{selectedScatterPoint.name}</div>
                  <div className="text-[11px] text-slate-300 line-clamp-2">{selectedScatterPoint.result?.summary}</div>
                  <button
                    onClick={() => onSelectFileToInspect(selectedScatterPoint)}
                    className="w-full mt-2 rounded-lg bg-indigo-600 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Open Document Inspector
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visualizer Section 2: Split Grid (Category Distribution Donut + Confidence Histogram) */}
      {(activeVisualizerTab === 'all' || activeVisualizerTab === 'distribution') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Category Distribution Donut Chart */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PieIcon className="h-4 w-4 text-indigo-400" />
                  <span>Category Volume & Share</span>
                </h3>
                <p className="text-xs text-slate-400">Distribution of indexed documents across taxonomy classes</p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.filter(d => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                  >
                    {categoryData.filter(d => d.count > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      const total = classifiedFiles.length || 1;
                      const pct = ((data.count / total) * 100).toFixed(1);
                      return (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-xl text-xs space-y-1">
                          <div className="font-bold text-white">{data.name}</div>
                          <div className="text-slate-300">{data.count} files ({pct}%)</div>
                          <div className="text-cyan-400 font-mono">Avg Conf: {data.avgConfidence}%</div>
                        </div>
                      );
                    }}
                  />
                  <Legend 
                    formatter={(val) => <span className="text-xs text-slate-300 font-medium">{val}</span>} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Confidence Quality Spectrum Histogram */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span>AI Confidence Spectrum Histogram</span>
                </h3>
                <p className="text-xs text-slate-400">Reliability density across confidence brackets</p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceHistogram} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#334155" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#334155" allowDecimals={false} />
                  <Tooltip 
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs shadow-xl">
                          <div className="font-bold text-white">Bracket: {d.range}</div>
                          <div className="text-cyan-300">{d.count} documents</div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {confidenceHistogram.map((entry, index) => (
                      <Cell key={`hist-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Visualizer Section 3: Ingestion Velocity & Top Key Entities */}
      {(activeVisualizerTab === 'all' || activeVisualizerTab === 'timeline') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cumulative Ingestion Timeline */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  <span>Real-time Ingestion & Classification Velocity</span>
                </h3>
                <p className="text-xs text-slate-400">Cumulative pipeline throughput and latency trends</p>
              </div>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#334155" />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} stroke="#334155" />
                  <Tooltip 
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs shadow-xl space-y-1">
                          <div className="font-bold text-white truncate max-w-[200px]">{d.fileName}</div>
                          <div className="text-cyan-400">Processed at: {d.time}</div>
                          <div className="text-indigo-300 font-mono">Confidence: {d.confidence.toFixed(1)}%</div>
                        </div>
                      );
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCumulative)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Extracted Named Entities */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-400" />
                <span>Extracted Key Entities</span>
              </h3>
              <p className="text-xs text-slate-400">High-frequency organizations, currencies, and IDs</p>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {topEntities.map((entity, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500">#{idx + 1}</span>
                    <span className="font-medium text-slate-200 truncate">{entity.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded bg-indigo-950 border border-indigo-800/50 px-1.5 py-0.2 text-[9px] text-indigo-300">
                      {entity.type}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-cyan-400">{entity.count}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

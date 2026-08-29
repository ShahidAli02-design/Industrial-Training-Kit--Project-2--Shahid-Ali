import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  ArrowRight, 
  Check, 
  RotateCcw,
  Zap,
  TrendingUp,
  FileCheck2,
  HelpCircle,
  Play
} from 'lucide-react';
import { FileItem, TaxonomySchema } from '../types';
import { generateSyntheticDocuments } from '../services/api';

interface ActiveLearningViewProps {
  files: FileItem[];
  taxonomy: TaxonomySchema;
  onUpdateFile: (updated: FileItem) => void;
  onSelectFileToInspect: (file: FileItem) => void;
  onAddBatchFiles: (newFiles: FileItem[]) => void;
}

export const ActiveLearningView: React.FC<ActiveLearningViewProps> = ({
  files = [],
  taxonomy,
  onUpdateFile,
  onSelectFileToInspect,
  onAddBatchFiles
}) => {
  const [selectedReviewCategory, setSelectedReviewCategory] = useState<string>('');
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [syntheticCount, setSyntheticCount] = useState<number>(4);
  const [selectedBenchmarkCat, setSelectedBenchmarkCat] = useState<string>(taxonomy?.categories?.[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'review' | 'matrix' | 'benchmark'>('review');

  const safeFiles = files || [];

  // Low confidence & flagged items
  const reviewQueue = useMemo(() => {
    return safeFiles.filter(f => f && (f.status === 'flagged_review' || (f.result && f.result.confidence < 80)));
  }, [safeFiles]);

  // Verified / Corrected items count
  const verifiedCount = useMemo(() => {
    return safeFiles.filter(f => f && f.status === 'classified' && f.result && f.result.confidence >= 80).length;
  }, [safeFiles]);

  const totalClassified = safeFiles.filter(f => f && f.result).length;
  const automationRate = totalClassified > 0 ? (((totalClassified - reviewQueue.length) / totalClassified) * 100).toFixed(1) : '100.0';

  // Handle Manual Human Correction
  const handleApplyCorrection = (file: FileItem, newCategoryId: string) => {
    const targetCat = taxonomy.categories.find(c => c.id === newCategoryId);
    if (!targetCat) return;

    const updatedFile: FileItem = {
      ...file,
      status: 'corrected',
      userOverrideCategory: newCategoryId,
      result: file.result ? {
        ...file.result,
        categoryId: targetCat.id,
        categoryName: targetCat.name,
        confidence: 99.0, // Human verified
        suggestedAction: 'Human-in-the-loop verified classification. Rule learned.',
        reasoning: [
          ...file.result.reasoning,
          `Human expert verified classification into ${targetCat.name}.`
        ]
      } : undefined
    };

    onUpdateFile(updatedFile);
  };

  // Run Synthetic Benchmark Generator
  const handleRunBenchmark = async () => {
    const targetCat = taxonomy.categories.find(c => c.id === selectedBenchmarkCat) || taxonomy.categories[0];
    if (!targetCat) return;

    setIsGeneratingBatch(true);
    try {
      const generated = await generateSyntheticDocuments(targetCat, syntheticCount, 'edge_case');
      
      const newItems: FileItem[] = generated.map((doc, idx) => ({
        id: `synth-${Date.now()}-${idx}`,
        name: doc.fileName,
        size: doc.simulatedSize,
        type: doc.fileType,
        uploadedAt: new Date().toISOString(),
        contentSnippet: doc.content,
        rawContent: doc.content,
        status: 'pending',
        tags: doc.tags || ['Synthetic Benchmark'],
        source: 'synthetic'
      }));

      onAddBatchFiles(newItems);
      alert(`Generated ${newItems.length} synthetic benchmark files for "${targetCat.name}". Queued for classification!`);
    } catch (err: any) {
      alert(`Benchmark error: ${err.message}`);
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  // Confusion Matrix Calculation (Simulated vs Actual)
  const confusionMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    
    // Initialize matrix
    taxonomy.categories.forEach(rowCat => {
      matrix[rowCat.id] = {};
      taxonomy.categories.forEach(colCat => {
        matrix[rowCat.id][colCat.id] = 0;
      });
    });

    files.forEach(f => {
      if (f.result) {
        const predicted = f.result.categoryId;
        const actual = f.userOverrideCategory || f.result.categoryId;
        if (matrix[actual] && matrix[actual][predicted] !== undefined) {
          matrix[actual][predicted] += 1;
        }
      }
    });

    return matrix;
  }, [files, taxonomy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="active-learning-container">
      
      {/* Top Banner: Active Learn Studio Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 p-6 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Active Learning & Model Calibration Studio</h1>
              <p className="text-xs text-slate-300">Human-in-the-loop verification, edge-case tuning, and synthetic benchmarks</p>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950/80 p-1">
            <button
              onClick={() => setActiveSubTab('review')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeSubTab === 'review' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Review Queue ({reviewQueue.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('matrix')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeSubTab === 'matrix' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Confusion Matrix</span>
            </button>
            <button
              onClick={() => setActiveSubTab('benchmark')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeSubTab === 'benchmark' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Synthetic Benchmark</span>
            </button>
          </div>
        </div>

        {/* 4 Active Learning Performance KPIs */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-6 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Zero-Touch Automation</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">{automationRate}%</span>
              <span className="text-xs text-slate-400">no intervention</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Review Queue</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-400">{reviewQueue.length}</span>
              <span className="text-xs text-amber-400">need audit</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Verified High Confidence</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-cyan-400">{verifiedCount}</span>
              <span className="text-xs text-slate-400">validated</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Disambiguation Precision</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-indigo-300">97.8%</span>
              <span className="text-xs text-emerald-400">+2.4% tuned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 1: Human-in-the-Loop Review Queue */}
      {activeSubTab === 'review' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Low Confidence & Edge-Case Review Queue</h2>
              <p className="text-xs text-slate-400">
                Documents below {Math.round((taxonomy.defaultThreshold || 0.75) * 100)}% threshold or flagged with suspicious indicators
              </p>
            </div>
          </div>

          {reviewQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 py-16 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              <h4 className="text-base font-semibold text-white">All Documents Verified</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                There are no pending documents in the review queue. All current classifications exceed confidence thresholds.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewQueue.map((file) => {
                const cat = taxonomy.categories.find(c => c.id === file.result?.categoryId);
                return (
                  <div 
                    key={file.id} 
                    className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-5 shadow-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex h-9 w-9 items-center justify-center rounded-xl font-mono text-xs font-bold"
                          style={{ backgroundColor: `${cat?.color || '#f59e0b'}20`, color: cat?.color || '#f59e0b' }}
                        >
                          {cat?.code || 'DOC'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{file.name}</span>
                            <span className="rounded-full bg-amber-500/20 px-2 py-0.2 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                              {file.result?.confidence.toFixed(1)}% Conf
                            </span>
                            {file.result?.riskScore && file.result.riskScore > 5 && (
                              <span className="rounded-full bg-rose-500/20 px-2 py-0.2 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                                Risk: {file.result.riskScore}/10
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            AI Assigned: <span className="font-semibold text-white">{file.result?.categoryName}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectFileToInspect(file)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                      >
                        <span>Full Document Inspector</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Snippet & AI Uncertainty Reasoning */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs space-y-1 font-mono text-slate-300 max-h-[100px] overflow-y-auto">
                        <div className="text-[10px] font-sans text-slate-500 font-bold uppercase">Document Text Preview</div>
                        <p>{file.contentSnippet}</p>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs space-y-1 text-slate-300">
                        <div className="text-[10px] text-amber-400 font-bold uppercase">AI Uncertainty / Edge Case Notes</div>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                          {file.result?.reasoning.map((r, ridx) => (
                            <li key={ridx} className="leading-snug">{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Human Correction Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-300">Reassign Category:</span>
                        <select
                          defaultValue={file.result?.categoryId}
                          onChange={(e) => handleApplyCorrection(file, e.target.value)}
                          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
                        >
                          {taxonomy.categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApplyCorrection(file, file.result?.categoryId || '')}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Confirm AI Class</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Interactive Confusion Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white">Classification Confusion Matrix</h2>
            <p className="text-xs text-slate-400">
              Rows represent Verified / Actual Class, Columns represent AI Predicted Class. Diagonal values represent accurate matches.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr>
                  <th className="p-3 text-left font-bold text-slate-400 uppercase text-[10px]">Actual \ Predicted</th>
                  {taxonomy.categories.map(colCat => (
                    <th key={colCat.id} className="p-3 font-mono font-bold" style={{ color: colCat.color }}>
                      {colCat.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {taxonomy.categories.map(rowCat => (
                  <tr key={rowCat.id} className="hover:bg-slate-950/40">
                    <td className="p-3 text-left font-semibold text-white flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: rowCat.color }} />
                      <span>{rowCat.name}</span>
                    </td>
                    {taxonomy.categories.map(colCat => {
                      const count = confusionMatrix[rowCat.id]?.[colCat.id] || 0;
                      const isDiagonal = rowCat.id === colCat.id;
                      return (
                        <td key={colCat.id} className="p-3">
                          <span className={`inline-flex h-8 w-12 items-center justify-center rounded-lg font-mono font-bold text-xs ${
                            isDiagonal && count > 0 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                              : !isDiagonal && count > 0 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                              : 'text-slate-600'
                          }`}>
                            {count}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Synthetic Benchmark Generator */}
      {activeSubTab === 'benchmark' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Synthetic Document Stress-Test Benchmarker</span>
            </h2>
            <p className="text-xs text-slate-400">
              Generate realistic synthetic test documents with edge cases to stress-test your taxonomy rules without uploading private files.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Target Category for Generation</label>
              <select
                value={selectedBenchmarkCat}
                onChange={(e) => setSelectedBenchmarkCat(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                {taxonomy.categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Batch Quantity</label>
              <select
                value={syntheticCount}
                onChange={(e) => setSyntheticCount(parseInt(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={2}>2 Synthetic Documents</option>
                <option value={4}>4 Synthetic Documents</option>
                <option value={8}>8 Synthetic Documents</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRunBenchmark}
                disabled={isGeneratingBatch}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/30 hover:opacity-95 disabled:opacity-50"
              >
                {isGeneratingBatch ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    <span>Synthesizing Test Set...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Generate & Ingest Benchmark Set</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

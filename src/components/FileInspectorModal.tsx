import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  Clock, 
  Tag, 
  Download, 
  Edit3, 
  Check, 
  Copy, 
  ArrowRight,
  Code2,
  Table,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { FileItem, TaxonomySchema } from '../types';

interface FileInspectorModalProps {
  file: FileItem | null;
  onClose: () => void;
  taxonomy: TaxonomySchema;
  onUpdateFile: (updated: FileItem) => void;
}

export const FileInspectorModal: React.FC<FileInspectorModalProps> = ({
  file,
  onClose,
  taxonomy,
  onUpdateFile
}) => {
  if (!file) return null;

  const [activeViewMode, setActiveViewMode] = useState<'extracted' | 'raw' | 'json'>('extracted');
  const [selectedNewCategory, setSelectedNewCategory] = useState<string>(file.result?.categoryId || '');
  const [userNote, setUserNote] = useState<string>(file.userNotes || '');
  const [isCopied, setIsCopied] = useState(false);

  const cat = taxonomy.categories.find(c => c.id === file.result?.categoryId);
  const catColor = cat?.color || '#6366f1';

  // Handle Manual Category Reassignment
  const handleSaveReassignment = () => {
    const targetCat = taxonomy.categories.find(c => c.id === selectedNewCategory);
    if (!targetCat) return;

    const updatedFile: FileItem = {
      ...file,
      status: 'corrected',
      userOverrideCategory: targetCat.id,
      userNotes: userNote,
      result: file.result ? {
        ...file.result,
        categoryId: targetCat.id,
        categoryName: targetCat.name,
        confidence: 99.5,
        suggestedAction: 'Human override applied.',
        reasoning: [
          ...file.result.reasoning,
          `Human verified reclassification to ${targetCat.name}.`
        ]
      } : undefined
    };

    onUpdateFile(updatedFile);
    alert(`Document re-classified as ${targetCat.name}!`);
  };

  // Copy JSON Metadata
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(file.result || {}, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Export Classification Report
  const handleDownloadReport = () => {
    const reportData = {
      fileName: file.name,
      fileType: file.type,
      sizeBytes: file.size,
      uploadedAt: file.uploadedAt,
      classification: file.result,
      taxonomyUsed: { id: taxonomy.id, name: taxonomy.name, version: taxonomy.version }
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${file.name.replace(/\.[^/.]+$/, '')}_classification_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold"
              style={{ backgroundColor: `${catColor}20`, color: catColor, border: `1px solid ${catColor}50` }}
            >
              {cat?.code || 'DOC'}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate max-w-xl">{file.name}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{(file.size / 1024).toFixed(1)} KB</span>
                <span>•</span>
                <span>{file.type || 'Document'}</span>
                <span>•</span>
                <span className="font-mono text-cyan-400">Engine: {file.result?.modelUsed || 'Gemini 3.7 Flash'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Report</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body: Split Screen (Left: Document Content & Preview / Right: Classification Intelligence Studio) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* Left Column: Raw Document Content View */}
          <div className="lg:col-span-5 flex flex-col bg-slate-950/60 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 bg-slate-900/60">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-cyan-400" />
                <span>Raw Document Extract</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">{file.contentSnippet?.length || 0} chars</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-indigo-500 selection:text-white">
              {file.rawContent || file.contentSnippet || 'No text snippet available.'}
            </div>
          </div>

          {/* Right Column: Classification Breakdown & Structured Extraction */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden bg-slate-900">
            
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-3 bg-slate-950/40">
              <div className="flex items-center gap-1 rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button
                  onClick={() => setActiveViewMode('extracted')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    activeViewMode === 'extracted' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Table className="h-3.5 w-3.5" />
                  <span>Metadata & Entities</span>
                </button>
                <button
                  onClick={() => setActiveViewMode('json')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    activeViewMode === 'json' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Structured JSON</span>
                </button>
              </div>

              {file.result && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Match Confidence:</span>
                  <span className="font-mono text-sm font-bold text-cyan-400">{file.result.confidence.toFixed(1)}%</span>
                </div>
              )}
            </div>

            {/* Main Details Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {file.result ? (
                <>
                  {/* Category & Summary Banner */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span 
                          className="rounded-lg px-2.5 py-1 text-xs font-bold"
                          style={{ backgroundColor: `${catColor}20`, color: catColor, border: `1px solid ${catColor}50` }}
                        >
                          {file.result.categoryName}
                        </span>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          file.result.urgency === 'critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          Urgency: {file.result.urgency.toUpperCase()}
                        </span>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          file.result.riskScore > 6 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          Risk Score: {file.result.riskScore}/10
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      {file.result.summary}
                    </p>

                    {file.result.suggestedAction && (
                      <div className="rounded-lg bg-indigo-950/30 border border-indigo-500/20 p-2.5 text-xs text-indigo-300 flex items-start gap-2">
                        <Sparkles className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                        <div>
                          <span className="font-semibold text-white">Recommended Action: </span>
                          <span>{file.result.suggestedAction}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {activeViewMode === 'extracted' ? (
                    <div className="space-y-6">
                      
                      {/* Extracted Required Metadata Key-Values */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Extracted Structured Attributes
                        </h4>
                        
                        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-semibold text-slate-400">
                              <tr>
                                <th className="px-4 py-2">Field Key</th>
                                <th className="px-4 py-2">Extracted Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300">
                              {Object.entries(file.result.extractedFields || {}).map(([key, val], vidx) => (
                                <tr key={vidx} className="hover:bg-slate-900/30">
                                  <td className="px-4 py-2.5 font-mono text-cyan-300 text-[11px] font-medium">{key}</td>
                                  <td className="px-4 py-2.5 font-semibold text-white">
                                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Key Entities Detected */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Detected Named Entities ({file.result.keyEntities.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {file.result.keyEntities.map((ent, eidx) => (
                            <div key={eidx} className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1 text-xs">
                              <span className="font-semibold text-white">{ent.name}</span>
                              <span className="rounded bg-indigo-950 border border-indigo-800/60 px-1.5 py-0.2 text-[9px] text-indigo-300 font-mono">
                                {ent.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Step-by-Step AI Reasoning Logs */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          AI Reasoning & Evidence Trail
                        </h4>
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
                          {file.result.reasoning.map((r, ridx) => (
                            <div key={ridx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-mono text-indigo-400">
                                {ridx + 1}
                              </span>
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Secondary Overlapping Matches (if any) */}
                      {file.result.secondaryMatches && file.result.secondaryMatches.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Secondary Category Proximity
                          </h4>
                          <div className="space-y-2">
                            {file.result.secondaryMatches.map((sm, sidx) => (
                              <div key={sidx} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs">
                                <div>
                                  <div className="font-semibold text-white">{sm.categoryName}</div>
                                  <div className="text-[11px] text-slate-400">{sm.reason}</div>
                                </div>
                                <span className="font-mono font-bold text-slate-400">{sm.confidence.toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    /* JSON View */
                    <div className="relative">
                      <button
                        onClick={handleCopyJson}
                        className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <pre className="max-h-[400px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] text-cyan-300">
                        {JSON.stringify(file.result, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Manual Reclassification Footer */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                      <span>Manual Human Reclassification & Notes</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400">Override Category</label>
                        <select
                          value={selectedNewCategory}
                          onChange={(e) => setSelectedNewCategory(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                        >
                          {taxonomy.categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">Review Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Verified vendor contract terms..."
                          value={userNote}
                          onChange={(e) => setUserNote(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleSaveReassignment}
                        className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                      >
                        Apply Human Override
                      </button>
                    </div>
                  </div>

                </>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  Document has not yet been classified.
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

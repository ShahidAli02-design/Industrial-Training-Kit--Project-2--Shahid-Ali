import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldAlert, 
  Zap, 
  RotateCcw,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Plus,
  Play,
  FileCheck
} from 'lucide-react';
import { FileItem, TaxonomySchema } from '../types';

interface ClassifyIngestViewProps {
  files: FileItem[];
  activeTaxonomy: TaxonomySchema;
  onUploadFiles: (uploadedFiles: File[]) => void;
  onClassifyPending: () => void;
  onSelectFileToInspect: (file: FileItem) => void;
  onQuickSampleLoad: () => void;
  onManualTextSubmit: (title: string, text: string) => void;
  isProcessingBatch: boolean;
}

export const ClassifyIngestView: React.FC<ClassifyIngestViewProps> = ({
  files = [],
  activeTaxonomy,
  onUploadFiles,
  onClassifyPending,
  onSelectFileToInspect,
  onQuickSampleLoad,
  onManualTextSubmit,
  isProcessingBatch
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'classified' | 'processing' | 'flagged_review'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(Array.from(e.target.files));
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim()) return;
    onManualTextSubmit(pasteTitle.trim() || 'Pasted_Text_Document.txt', pasteContent);
    setPasteTitle('');
    setPasteContent('');
    setShowPasteBox(false);
  };

  // Filtered files list
  const safeFiles = files || [];
  const filteredFiles = safeFiles.filter(f => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && f.result?.categoryId !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.name?.toLowerCase().includes(q);
      const matchCat = f.result?.categoryName?.toLowerCase().includes(q);
      const matchSnippet = f.contentSnippet?.toLowerCase().includes(q);
      const matchTag = (f.tags || []).some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchCat && !matchSnippet && !matchTag) return false;
    }
    return true;
  });

  const pendingCount = safeFiles.filter(f => f.status === 'pending').length;
  const classifiedCount = safeFiles.filter(f => f.status === 'classified').length;
  const flaggedCount = safeFiles.filter(f => f.status === 'flagged_review' || (f.result && f.result.confidence < 75)).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="classify-ingest-container">
      
      {/* Top Banner: Real-time Ingestion & Drag Drop Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Drag & Drop Dropzone */}
        <div className="lg:col-span-8">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-cyan-400 bg-cyan-950/20 scale-[0.99]'
                : 'border-slate-800 bg-slate-900/60 hover:border-indigo-500/60 hover:bg-slate-900/90'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.csv,.json,.png,.jpg,.jpeg,.xlsx"
            />
            
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-cyan-500/20 border border-indigo-500/30 text-cyan-400 shadow-xl group-hover:scale-110 transition-transform">
              <UploadCloud className="h-8 w-8" />
            </div>

            <div className="mt-4 space-y-1">
              <h2 className="text-base font-bold text-white">
                Drag & Drop Files for Real-Time AI Classification
              </h2>
              <p className="text-xs text-slate-400">
                Supports PDF, DOCX, TXT, CSV, JSON, Scanned Invoices, and Images (Multi-file batch supported)
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-slate-800/90 px-3 py-1 text-[11px] font-medium text-slate-300">
                ⚡ Real-time Multi-modal Stream
              </span>
              <span className="rounded-full bg-slate-800/90 px-3 py-1 text-[11px] font-medium text-slate-300">
                🎯 Matching against {activeTaxonomy.categories.length} {activeTaxonomy.name} categories
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls & Pipeline Status */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pipeline Queue Status</span>
              {isProcessingBatch ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 animate-pulse">
                  <Sparkles className="h-3.5 w-3.5" /> Processing...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Engine Ready
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-center">
                <div className="text-[10px] text-slate-400">Classified</div>
                <div className="text-lg font-bold text-white font-mono">{classifiedCount}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-center">
                <div className="text-[10px] text-slate-400">Pending</div>
                <div className="text-lg font-bold text-cyan-400 font-mono">{pendingCount}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-center">
                <div className="text-[10px] text-slate-400">Flagged</div>
                <div className="text-lg font-bold text-amber-400 font-mono">{flaggedCount}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            {pendingCount > 0 && (
              <button
                id="btn-process-pending-queue"
                onClick={onClassifyPending}
                disabled={isProcessingBatch}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Classify {pendingCount} Pending File{pendingCount > 1 ? 's' : ''}</span>
              </button>
            )}

            <button
              id="btn-load-sample-documents"
              onClick={onQuickSampleLoad}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>Load 3 Test Sample Documents</span>
            </button>

            <button
              onClick={() => setShowPasteBox(!showPasteBox)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{showPasteBox ? 'Hide Text Input' : 'Paste Raw Text Snippet'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Paste Raw Text Box (if active) */}
      {showPasteBox && (
        <form onSubmit={handlePasteSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>Ingest Custom Raw Text Snippet</span>
            </h3>
            <button type="button" onClick={() => setShowPasteBox(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              placeholder="Document Title (e.g. Acme_Vendor_Consulting_Invoice.txt)"
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
            <textarea
              rows={4}
              placeholder="Paste raw invoice text, receipt lines, contract body, server logs, or email content..."
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              required
              className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowPasteBox(false)}
              className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Submit & Classify Instantly</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by filename, category, entity or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-72 rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Categories ({activeTaxonomy.categories.length})</option>
            {activeTaxonomy.categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({files.length})
          </button>
          <button
            onClick={() => setStatusFilter('classified')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === 'classified' ? 'bg-emerald-600/80 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Classified ({classifiedCount})
          </button>
          <button
            onClick={() => setStatusFilter('flagged_review')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === 'flagged_review' ? 'bg-amber-600/80 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Flagged ({flaggedCount})
          </button>
        </div>
      </div>

      {/* Files Grid / Card Stream */}
      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/20 py-16 text-center space-y-3">
          <FileText className="h-10 w-10 text-slate-600" />
          <h4 className="text-base font-semibold text-slate-300">No documents match the current filter</h4>
          <p className="text-xs text-slate-500 max-w-sm">
            Drag and drop files above, or click "Load 3 Test Sample Documents" to begin real-time classification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFiles.map((file) => {
            const cat = activeTaxonomy.categories.find(c => c.id === file.result?.categoryId);
            const isProcessing = file.status === 'processing';
            const isPending = file.status === 'pending';
            const isFlagged = file.status === 'flagged_review' || (file.result && file.result.confidence < 75);
            const catColor = cat?.color || '#6366f1';

            return (
              <div
                key={file.id}
                onClick={() => onSelectFileToInspect(file)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/70 p-5 shadow-lg transition-all hover:border-indigo-500/60 hover:bg-slate-900 hover:shadow-indigo-950/20 cursor-pointer"
              >
                <div className="space-y-3.5">
                  {/* File Header & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold shadow-sm"
                        style={{ backgroundColor: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40` }}
                      >
                        {cat?.code || file.type.slice(0, 3).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                          {file.name}
                        </h4>
                        <div className="text-[10px] text-slate-400">
                          {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {isProcessing ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300 animate-pulse">
                        <Sparkles className="h-3 w-3" /> Classifying
                      </span>
                    ) : isPending ? (
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                        Queued
                      </span>
                    ) : isFlagged ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        <AlertTriangle className="h-3 w-3" /> Review
                      </span>
                    ) : (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> {file.result?.confidence.toFixed(1)}%
                      </span>
                    )}
                  </div>

                  {/* Classification Category Result */}
                  {file.result && (
                    <div className="space-y-2 rounded-xl bg-slate-950/70 p-3 border border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Classified As</span>
                        <span 
                          className="rounded-md px-2 py-0.5 text-[11px] font-bold"
                          style={{ backgroundColor: `${catColor}20`, color: catColor }}
                        >
                          {file.result.categoryName}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {file.result.summary}
                      </p>

                      {/* Confidence Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">AI Confidence Match</span>
                          <span className="font-mono font-bold text-white">{file.result.confidence.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              file.result.confidence >= 90 
                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' 
                                : file.result.confidence >= 75 
                                ? 'bg-gradient-to-r from-indigo-500 to-cyan-400' 
                                : 'bg-gradient-to-r from-amber-500 to-rose-500'
                            }`}
                            style={{ width: `${file.result.confidence}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Extracted Key Entity Chips */}
                  {file.result?.keyEntities && file.result.keyEntities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {file.result.keyEntities.slice(0, 2).map((entity, eidx) => (
                        <span key={eidx} className="rounded-md bg-slate-800/90 border border-slate-700/60 px-2 py-0.5 text-[10px] text-slate-300 truncate max-w-[140px]">
                          {entity.name}
                        </span>
                      ))}
                      {file.result.keyEntities.length > 2 && (
                        <span className="rounded-md bg-slate-800/50 px-1.5 py-0.5 text-[10px] text-slate-500">
                          +{file.result.keyEntities.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Risk & Inspect Action */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-1.5">
                    {file.result && (
                      <span className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                        file.result.riskScore > 6 
                          ? 'bg-rose-500/20 text-rose-300' 
                          : file.result.riskScore > 3 
                          ? 'bg-amber-500/20 text-amber-300' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        Risk: {file.result.riskScore}/10
                      </span>
                    )}
                    {file.result?.processingTimeMs && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {file.result.processingTimeMs}ms
                      </span>
                    )}
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 group-hover:text-cyan-300 transition-colors">
                    <span>Inspect</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

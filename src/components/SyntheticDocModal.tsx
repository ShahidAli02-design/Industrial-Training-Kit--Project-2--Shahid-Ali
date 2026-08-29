import React, { useState } from 'react';
import { Sparkles, RefreshCw, Layers, Check, Play } from 'lucide-react';
import { TaxonomySchema, FileItem } from '../types';
import { generateSyntheticDocuments } from '../services/api';

interface SyntheticDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxonomy: TaxonomySchema;
  onAddFiles: (files: FileItem[]) => void;
}

export const SyntheticDocModal: React.FC<SyntheticDocModalProps> = ({
  isOpen,
  onClose,
  taxonomy,
  onAddFiles
}) => {
  if (!isOpen) return null;

  const [selectedCatId, setSelectedCatId] = useState<string>(taxonomy.categories[0]?.id || '');
  const [count, setCount] = useState<number>(3);
  const [complexity, setComplexity] = useState<'standard' | 'edge_case' | 'noisy'>('standard');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cat = taxonomy.categories.find(c => c.id === selectedCatId) || taxonomy.categories[0];
    if (!cat) return;

    setIsGenerating(true);
    try {
      const generated = await generateSyntheticDocuments(cat, count, complexity);

      const newFiles: FileItem[] = generated.map((doc, idx) => ({
        id: `synth-${Date.now()}-${idx}`,
        name: doc.fileName,
        size: doc.simulatedSize,
        type: doc.fileType,
        uploadedAt: new Date().toISOString(),
        contentSnippet: doc.content,
        rawContent: doc.content,
        status: 'pending',
        tags: doc.tags || ['Synthetic Test'],
        source: 'synthetic'
      }));

      onAddFiles(newFiles);
      onClose();
    } catch (err: any) {
      alert(`Synthetic generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generate Realistic Synthetic Documents</h3>
              <p className="text-xs text-slate-400">Powered by Gemini multimodal document generation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Target Taxonomy Category</label>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              {taxonomy.categories.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Document Count</label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value={1}>1 Document</option>
                <option value={3}>3 Documents</option>
                <option value={5}>5 Documents</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Complexity & Noise</label>
              <select
                value={complexity}
                onChange={(e: any) => setComplexity(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="standard">Standard Clean Format</option>
                <option value="edge_case">Edge Case / Cross-domain</option>
                <option value="noisy">Noisy / Incomplete OCR</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Automatic Pipeline Ingestion:</span>
            <p>Generated documents will be added directly into your pipeline queue for real-time classification and analytics.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:opacity-95 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Files...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Generate Documents</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Sliders, 
  Shield, 
  FileCode, 
  Download, 
  Upload, 
  Check, 
  AlertCircle, 
  Info,
  Tag,
  Key,
  Layers,
  ChevronRight,
  RefreshCw,
  Copy,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { TaxonomySchema, CategoryRule, ExtractedFieldDefinition } from '../types';
import { optimizeTaxonomyRules } from '../services/api';

interface TaxonomyConfigViewProps {
  activeTaxonomy: TaxonomySchema;
  onUpdateTaxonomy: (updated: TaxonomySchema) => void;
  allTaxonomies?: TaxonomySchema[];
  onSelectTaxonomy?: (tax: TaxonomySchema) => void;
  onResetPreset?: (presetId: string) => void;
}

export const TaxonomyConfigView: React.FC<TaxonomyConfigViewProps> = ({
  activeTaxonomy: taxonomy,
  onUpdateTaxonomy,
  allTaxonomies = [],
  onSelectTaxonomy,
  onResetPreset
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryRule | null>(taxonomy?.categories?.[0] || null);
  const [isEditingTaxonomyMeta, setIsEditingTaxonomyMeta] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');
  const [newCatPriority, setNewCatPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  // New Field Form State
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldType, setNewFieldType] = useState<'string' | 'number' | 'date' | 'boolean' | 'array'>('string');
  const [newFieldDesc, setNewFieldDesc] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [showAddField, setShowAddField] = useState(false);

  // Handle category selection
  const handleSelectCategory = (cat: CategoryRule) => {
    setActiveCategory(cat);
    setShowAddField(false);
  };

  // Add keyword
  const handleAddKeyword = () => {
    if (!newKeyword.trim() || !activeCategory) return;
    const updatedKeywords = [...activeCategory.keywords, newKeyword.trim()];
    const updatedCat = { ...activeCategory, keywords: updatedKeywords };
    updateCategoryInTaxonomy(updatedCat);
    setNewKeyword('');
  };

  // Remove keyword
  const handleRemoveKeyword = (kwToRemove: string) => {
    if (!activeCategory) return;
    const updatedKeywords = activeCategory.keywords.filter(k => k !== kwToRemove);
    const updatedCat = { ...activeCategory, keywords: updatedKeywords };
    updateCategoryInTaxonomy(updatedCat);
  };

  // Update Category in Taxonomy
  const updateCategoryInTaxonomy = (updatedCat: CategoryRule) => {
    const updatedCategories = taxonomy.categories.map(c => c.id === updatedCat.id ? updatedCat : c);
    const updatedTax = { ...taxonomy, categories: updatedCategories };
    onUpdateTaxonomy(updatedTax);
    setActiveCategory(updatedCat);
  };

  // Delete Category
  const handleDeleteCategory = (catId: string) => {
    if (taxonomy.categories.length <= 1) {
      alert('A taxonomy must have at least one category.');
      return;
    }
    const updatedCategories = taxonomy.categories.filter(c => c.id !== catId);
    const updatedTax = { ...taxonomy, categories: updatedCategories };
    onUpdateTaxonomy(updatedTax);
    setActiveCategory(updatedCategories[0]);
  };

  // Add New Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: CategoryRule = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      code: (newCatCode.trim() || newCatName.slice(0, 4)).toUpperCase(),
      description: newCatDesc.trim() || 'Custom classified document type.',
      color: newCatColor,
      iconName: 'FileText',
      keywords: [newCatName.toLowerCase(), newCatCode.toLowerCase()].filter(Boolean),
      confidenceThreshold: taxonomy.defaultThreshold || 0.75,
      priority: newCatPriority,
      requiredFields: [
        { id: `f-${Date.now()}`, name: 'Document Title', key: 'title', type: 'string', description: 'Main title', required: true }
      ]
    };

    const updatedCategories = [...taxonomy.categories, newCat];
    const updatedTax = { ...taxonomy, categories: updatedCategories };
    onUpdateTaxonomy(updatedTax);
    setActiveCategory(newCat);
    setShowNewCategoryModal(false);

    // Reset fields
    setNewCatName('');
    setNewCatCode('');
    setNewCatDesc('');
  };

  // Add Field to Active Category
  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory || !newFieldName.trim() || !newFieldKey.trim()) return;

    const newField: ExtractedFieldDefinition = {
      id: `field-${Date.now()}`,
      name: newFieldName.trim(),
      key: newFieldKey.trim().toLowerCase().replace(/\s+/g, '_'),
      type: newFieldType,
      description: newFieldDesc.trim() || newFieldName.trim(),
      required: newFieldRequired
    };

    const updatedFields = [...activeCategory.requiredFields, newField];
    const updatedCat = { ...activeCategory, requiredFields: updatedFields };
    updateCategoryInTaxonomy(updatedCat);

    setNewFieldName('');
    setNewFieldKey('');
    setNewFieldDesc('');
    setShowAddField(false);
  };

  // Remove Field
  const handleRemoveField = (fieldId: string) => {
    if (!activeCategory) return;
    const updatedFields = activeCategory.requiredFields.filter(f => f.id !== fieldId);
    const updatedCat = { ...activeCategory, requiredFields: updatedFields };
    updateCategoryInTaxonomy(updatedCat);
  };

  // Run AI Taxonomy Optimizer
  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    setOptimizationResult(null);
    try {
      const res = await optimizeTaxonomyRules(taxonomy);
      setOptimizationResult(res);
    } catch (err: any) {
      alert(`AI Optimization error: ${err.message}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Apply AI Suggestions
  const handleApplyAiSuggestions = () => {
    if (!optimizationResult) return;
    let updatedTax = { ...taxonomy };
    
    if (optimizationResult.enhancedSystemInstructions) {
      updatedTax.systemInstructions = optimizationResult.enhancedSystemInstructions;
    }

    if (optimizationResult.categoryRecommendations) {
      const updatedCats = taxonomy.categories.map(c => {
        const rec = optimizationResult.categoryRecommendations.find((r: any) => r.categoryName.toLowerCase() === c.name.toLowerCase());
        if (rec) {
          const mergedKeywords = Array.from(new Set([...c.keywords, ...(rec.additionalKeywords || [])]));
          return {
            ...c,
            keywords: mergedKeywords,
            exclusionRules: rec.suggestedExclusionRule || c.exclusionRules
          };
        }
        return c;
      });
      updatedTax.categories = updatedCats;
    }

    onUpdateTaxonomy(updatedTax);
    alert('AI optimizations applied successfully!');
    setOptimizationResult(null);
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(taxonomy, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${taxonomy.name.toLowerCase().replace(/\s+/g, '_')}_schema.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="taxonomy-configure-container">
      
      {/* Top Banner: Schema Header & Quick Actions */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <Sliders className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">{taxonomy.name}</h1>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                {taxonomy.industry}
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
                v{taxonomy.version}
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl">
              {taxonomy.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-run-ai-optimizer"
              onClick={handleRunOptimizer}
              disabled={isOptimizing}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Analyzing Schema...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  <span>AI Schema Optimizer</span>
                </>
              )}
            </button>

            <button
              id="btn-export-taxonomy-json"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700"
            >
              <Download className="h-4 w-4 text-slate-400" />
              <span>Export Schema</span>
            </button>

            <button
              id="btn-view-raw-schema-json"
              onClick={() => setShowJsonModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700"
            >
              <FileCode className="h-4 w-4 text-slate-400" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Global Taxonomy Controls Bar */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-800/80 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Default Confidence Threshold</span>
              <span className="font-mono text-xs font-bold text-cyan-400">{Math.round((taxonomy.defaultThreshold || 0.75) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={taxonomy.defaultThreshold || 0.75}
              onChange={(e) => onUpdateTaxonomy({ ...taxonomy, defaultThreshold: parseFloat(e.target.value) })}
              className="mt-2 w-full accent-cyan-400"
            />
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Strict Classification Mode</div>
              <div className="text-[11px] text-slate-400">Flag low confidence for human review</div>
            </div>
            <button
              onClick={() => onUpdateTaxonomy({ ...taxonomy, strictMode: !taxonomy.strictMode })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                taxonomy.strictMode ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                taxonomy.strictMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Multi-label / Secondary Match</div>
              <div className="text-[11px] text-slate-400">Identify overlapping categories</div>
            </div>
            <button
              onClick={() => onUpdateTaxonomy({ ...taxonomy, enableSecondaryClassification: !taxonomy.enableSecondaryClassification })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                taxonomy.enableSecondaryClassification ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                taxonomy.enableSecondaryClassification ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Total Active Categories</div>
              <div className="text-[11px] text-slate-400">{taxonomy.categories.length} defined classes</div>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-300">
              {taxonomy.categories.length}
            </span>
          </div>
        </div>
      </div>

      {/* AI Optimizer Results Panel (if active) */}
      {optimizationResult && (
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 p-6 shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white">AI Schema Analysis & Optimization Report</h3>
                <p className="text-xs text-slate-300">{optimizationResult.summaryOfImprovements}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/20">
                <span>Score:</span>
                <span className="font-mono text-cyan-400">{optimizationResult.overallScore}/100</span>
              </div>
              <button
                onClick={handleApplyAiSuggestions}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shadow"
              >
                <Check className="h-4 w-4" />
                Apply All AI Suggestions
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimizationResult.categoryRecommendations?.map((rec: any, idx: number) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">{rec.categoryName}</span>
                  <span className="text-[10px] text-cyan-400">+{rec.additionalKeywords?.length} keywords</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {rec.additionalKeywords?.map((kw: string, kidx: number) => (
                    <span key={kidx} className="rounded bg-indigo-950 border border-indigo-800/60 px-2 py-0.5 text-[10px] text-indigo-200">
                      +{kw}
                    </span>
                  ))}
                </div>
                {rec.suggestedExclusionRule && (
                  <p className="text-[11px] text-slate-400 italic">Rule: {rec.suggestedExclusionRule}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Taxonomy Builder: Split Layout (Categories List + Detailed Category Studio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Categories Navigation List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Categories ({taxonomy.categories.length})</h2>
            <button
              id="btn-add-category-modal"
              onClick={() => setShowNewCategoryModal(true)}
              className="flex items-center gap-1 rounded-lg border border-indigo-500/40 bg-indigo-600/20 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {taxonomy.categories.map((cat) => {
              const isSelected = activeCategory?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className={`group relative flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/30 shadow-lg shadow-indigo-950/40'
                      : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold shadow-sm"
                      style={{ backgroundColor: `${cat.color}25`, color: cat.color, border: `1px solid ${cat.color}50` }}
                    >
                      {cat.code}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white truncate">{cat.name}</span>
                        {cat.priority === 'critical' && (
                          <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-bold text-rose-300">
                            Critical
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{cat.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                      {cat.requiredFields.length} fields
                    </span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Preset Reset / Switcher */}
          {allTaxonomies.length > 0 && (
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                <span>Load Preset Template</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {allTaxonomies.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (onSelectTaxonomy) onSelectTaxonomy(t);
                      else if (onResetPreset) onResetPreset(t.id);
                    }}
                    className={`rounded-lg border px-2.5 py-2 text-left text-[11px] font-medium transition-colors ${
                      taxonomy.id === t.id
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold truncate">{t.name}</div>
                    <div className="text-[10px] text-slate-400">{t.categories?.length || 0} classes</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Category Deep-Dive Editor */}
        {activeCategory ? (
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-xl">
              
              {/* Category Header with Color & Code */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-xl font-mono text-base font-bold shadow-md"
                    style={{ backgroundColor: `${activeCategory.color}25`, color: activeCategory.color, border: `1px solid ${activeCategory.color}60` }}
                  >
                    {activeCategory.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">{activeCategory.name}</h3>
                      <input
                        type="color"
                        value={activeCategory.color}
                        onChange={(e) => updateCategoryInTaxonomy({ ...activeCategory, color: e.target.value })}
                        className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                        title="Change Category Color"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Code: <span className="font-mono text-slate-300">{activeCategory.code}</span> • ID: <span className="font-mono text-slate-400">{activeCategory.id}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteCategory(activeCategory.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Category</span>
                  </button>
                </div>
              </div>

              {/* Description & Classification Guidance */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Category Purpose & Scope Description
                </label>
                <textarea
                  rows={2}
                  value={activeCategory.description}
                  onChange={(e) => updateCategoryInTaxonomy({ ...activeCategory, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="Describe the exact criteria for files belonging in this category..."
                />
              </div>

              {/* Keywords / Trigger Phrases */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Classification Keywords & Semantic Anchors</span>
                  </label>
                  <span className="text-[11px] text-slate-400">{activeCategory.keywords.length} active tags</span>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[42px] rounded-xl border border-slate-800 bg-slate-950 p-3">
                  {activeCategory.keywords.map((kw, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-200"
                    >
                      <span>{kw}</span>
                      <button
                        onClick={() => handleRemoveKeyword(kw)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                      placeholder="+ Add keyword..."
                      className="rounded-lg bg-transparent px-2 py-0.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    {newKeyword && (
                      <button
                        onClick={handleAddKeyword}
                        className="rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-indigo-500"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Exclusion & Disambiguation Rules */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  <span>Negative Exclusion & Boundary Rules (Optional)</span>
                </label>
                <input
                  type="text"
                  value={activeCategory.exclusionRules || ''}
                  onChange={(e) => updateCategoryInTaxonomy({ ...activeCategory, exclusionRules: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Do not classify internal draft memos or temporary receipts under this code..."
                />
              </div>

              {/* Required Metadata Extraction Schema Fields */}
              <div className="space-y-4 border-t border-slate-800/80 pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Key className="h-4 w-4 text-cyan-400" />
                      <span>Required Document Metadata Fields</span>
                    </h4>
                    <p className="text-xs text-slate-400">Structured data entities extracted automatically during classification</p>
                  </div>
                  <button
                    onClick={() => setShowAddField(true)}
                    className="flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Extraction Field</span>
                  </button>
                </div>

                {/* Add Field Form */}
                {showAddField && (
                  <form onSubmit={handleAddField} className="rounded-xl border border-cyan-500/30 bg-slate-950 p-4 space-y-3 animate-in fade-in duration-200">
                    <div className="text-xs font-bold text-cyan-300">Define New Extraction Field</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Field Display Name (e.g. Invoice Number)"
                        value={newFieldName}
                        onChange={(e) => {
                          setNewFieldName(e.target.value);
                          if (!newFieldKey) setNewFieldKey(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                        }}
                        required
                        className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="JSON Key (e.g. invoice_number)"
                        value={newFieldKey}
                        onChange={(e) => setNewFieldKey(e.target.value)}
                        required
                        className="rounded-lg border border-slate-800 bg-slate-900 p-2 font-mono text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                      <select
                        value={newFieldType}
                        onChange={(e: any) => setNewFieldType(e.target.value)}
                        className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="string">String / Text</option>
                        <option value="number">Number / Amount</option>
                        <option value="date">Date</option>
                        <option value="boolean">Boolean (True/False)</option>
                        <option value="array">Array / List</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newFieldRequired}
                          onChange={(e) => setNewFieldRequired(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                        />
                        <span>Mandatory field (affects confidence if missing)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddField(false)}
                          className="rounded-lg px-3 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-cyan-500 px-3.5 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
                        >
                          Save Field
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Fields Table */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold text-slate-400">
                      <tr>
                        <th className="px-4 py-2.5">Field Name</th>
                        <th className="px-4 py-2.5">JSON Key</th>
                        <th className="px-4 py-2.5">Data Type</th>
                        <th className="px-4 py-2.5">Required</th>
                        <th className="px-4 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {activeCategory.requiredFields.map((field) => (
                        <tr key={field.id} className="hover:bg-slate-900/40">
                          <td className="px-4 py-2.5 font-medium text-white">{field.name}</td>
                          <td className="px-4 py-2.5 font-mono text-cyan-300">{field.key}</td>
                          <td className="px-4 py-2.5">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300 uppercase">
                              {field.type}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            {field.required ? (
                              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                                Required
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px]">Optional</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => handleRemoveField(field.id)}
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                              title="Delete Field"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        ) : null}

      </div>

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Classification Category</h3>
              <button onClick={() => setShowNewCategoryModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Service Level Agreement"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (!newCatCode) setNewCatCode(e.target.value.slice(0, 4).toUpperCase());
                  }}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Short Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SLA"
                    value={newCatCode}
                    onChange={(e) => setNewCatCode(e.target.value.toUpperCase())}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Category Color</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded-xl border border-slate-800 bg-slate-950 p-1"
                    />
                    <span className="font-mono text-xs text-slate-400">{newCatColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="What kinds of files belong in this category?..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCategoryModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raw JSON Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="h-4 w-4 text-cyan-400" />
                <span>Taxonomy Schema Definition (JSON)</span>
              </h3>
              <button onClick={() => setShowJsonModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <pre className="max-h-[500px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] text-emerald-400">
              {JSON.stringify(taxonomy, null, 2)}
            </pre>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(taxonomy, null, 2));
                  alert('Taxonomy JSON copied to clipboard!');
                }}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                <Copy className="h-4 w-4" />
                <span>Copy JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

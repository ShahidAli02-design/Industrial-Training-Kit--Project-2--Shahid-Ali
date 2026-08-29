import React from 'react';
import { 
  Sparkles, 
  Settings2, 
  UploadCloud, 
  BarChart3, 
  GraduationCap, 
  Database, 
  ChevronDown,
  Activity,
  SlidersHorizontal
} from 'lucide-react';
import { TaxonomySchema, FileItem, NavigationTab } from '../types';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeTaxonomy: TaxonomySchema;
  taxonomies?: TaxonomySchema[];
  onSelectTaxonomy?: (tax: TaxonomySchema) => void;
  files?: FileItem[];
  onOpenSyntheticModal: () => void;
  aiEngineStatus?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeTaxonomy,
  taxonomies = [],
  onSelectTaxonomy,
  files = [],
  onOpenSyntheticModal
}) => {
  const [showTaxMenu, setShowTaxMenu] = React.useState(false);
  const processingCount = (files || []).filter(f => f.status === 'processing' || f.status === 'pending').length;
  const reviewCount = (files || []).filter(f => f.status === 'flagged_review' || (f.result && f.result.confidence < 75)).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand & Engine Beacon */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div 
            onClick={() => onSelectTab('classify')}
            className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90"
            id="brand-logo-container"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Sparkles className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">Classify<span className="text-cyan-400">Learn</span></span>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">v3.2</span>
              </div>
              <p className="hidden sm:block text-[11px] font-medium text-slate-400">Real-time Intelligence & Taxonomy Studio</p>
            </div>
          </div>

          {/* Active Taxonomy Selector */}
          {taxonomies.length > 0 && activeTaxonomy && (
            <div className="relative hidden md:block">
              <button
                id="taxonomy-selector-button"
                onClick={() => setShowTaxMenu(!showTaxMenu)}
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-800/80"
              >
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-slate-400">Schema:</span>
                <span className="font-semibold text-white truncate max-w-[140px]">{activeTaxonomy.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showTaxMenu && (
                <div className="absolute left-0 top-full mt-2 w-72 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl shadow-black/80 z-50">
                  <div className="px-2.5 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Available Taxonomies
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {taxonomies.map(tax => (
                      <button
                        key={tax.id}
                        onClick={() => {
                          onSelectTaxonomy?.(tax);
                          setShowTaxMenu(false);
                        }}
                        className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          activeTaxonomy.id === tax.id 
                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <SlidersHorizontal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <div>
                          <div className="font-medium text-white">{tax.name}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{tax.industry} • {tax.categories?.length || 0} categories</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-1.5 border-t border-slate-800/80 pt-1.5">
                    <button
                      onClick={() => {
                        onSelectTab('configure');
                        setShowTaxMenu(false);
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                    >
                      <Settings2 className="h-3.5 w-3.5 text-cyan-400" />
                      Configure Schema Rules
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/60 p-1">
          <button
            id="nav-tab-classify"
            onClick={() => onSelectTab('classify')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold transition-all ${
              currentTab === 'classify'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span className="hidden sm:inline">Classify & Ingest</span>
            <span className="sm:hidden">Ingest</span>
            {processingCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-slate-950 animate-pulse">
                {processingCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-configure"
            onClick={() => onSelectTab('configure')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold transition-all ${
              currentTab === 'configure'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Configure</span>
            <span className="sm:hidden">Rules</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300">
              {activeTaxonomy?.categories?.length || 0}
            </span>
          </button>

          <button
            id="nav-tab-visualize"
            onClick={() => onSelectTab('visualize')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold transition-all ${
              currentTab === 'visualize'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Visualizer</span>
          </button>

          <button
            id="nav-tab-active-learning"
            onClick={() => onSelectTab('active-learning')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold transition-all ${
              currentTab === 'active-learning'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Active Learn</span>
            <span className="sm:hidden">Learn</span>
            {reviewCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-950">
                {reviewCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-library"
            onClick={() => onSelectTab('library')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold transition-all ${
              currentTab === 'library'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Dataset</span>
            <span className="sm:hidden">Data</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300">
              {files.length}
            </span>
          </button>
        </nav>

        {/* Right: Quick Synthetic Generator & AI Engine Status */}
        <div className="flex items-center gap-3">
          <button
            id="btn-generate-synthetic-sample"
            onClick={onOpenSyntheticModal}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-500/20 hover:border-cyan-500/50"
            title="Generate synthetic documents to test classification rules"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Synthetic Gen</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-[11px] text-slate-300">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Engine:</span>
            <span className="font-mono text-emerald-300">Gemini 3.7 Flash</span>
          </div>
        </div>

      </div>
    </header>
  );
};

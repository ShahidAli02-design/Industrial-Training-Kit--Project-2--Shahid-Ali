import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  Trash2, 
  Filter, 
  CheckSquare, 
  Square, 
  FileText, 
  ExternalLink,
  ChevronDown,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { FileItem, TaxonomySchema } from '../types';

interface DataLibraryViewProps {
  files: FileItem[];
  taxonomy: TaxonomySchema;
  onSelectFileToInspect: (file: FileItem) => void;
  onDeleteFile: (fileId: string) => void;
  onBulkDelete: (fileIds: string[]) => void;
}

export const DataLibraryView: React.FC<DataLibraryViewProps> = ({
  files = [],
  taxonomy,
  onSelectFileToInspect,
  onDeleteFile,
  onBulkDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'name' | 'risk'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const safeFiles = files || [];

  // Filter & Sort
  const filteredFiles = safeFiles.filter(f => {
    if (!f) return false;
    if (selectedCategory !== 'all' && f.result?.categoryId !== selectedCategory) return false;
    if (selectedStatus !== 'all' && f.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.name?.toLowerCase().includes(q);
      const matchCat = f.result?.categoryName?.toLowerCase().includes(q);
      const matchSnippet = f.contentSnippet?.toLowerCase().includes(q);
      const matchTag = (f.tags || []).some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchCat && !matchSnippet && !matchTag) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      const diff = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      return sortOrder === 'asc' ? diff : -diff;
    }
    if (sortBy === 'confidence') {
      const diff = (a.result?.confidence || 0) - (b.result?.confidence || 0);
      return sortOrder === 'asc' ? diff : -diff;
    }
    if (sortBy === 'risk') {
      const diff = (a.result?.riskScore || 0) - (b.result?.riskScore || 0);
      return sortOrder === 'asc' ? diff : -diff;
    }
    return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });

  // Toggle All Selection
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFiles.map(f => f.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const targetFiles = selectedIds.length > 0
      ? files.filter(f => selectedIds.includes(f.id))
      : filteredFiles;

    const headers = ['File Name', 'Category', 'Confidence (%)', 'Risk Score', 'Urgency', 'Size (KB)', 'Uploaded At', 'Summary'];
    const rows = targetFiles.map(f => [
      `"${f.name.replace(/"/g, '""')}"`,
      `"${f.result?.categoryName || 'Unclassified'}"`,
      f.result?.confidence.toFixed(1) || '0',
      f.result?.riskScore || '1',
      f.result?.urgency || 'medium',
      (f.size / 1024).toFixed(1),
      f.uploadedAt,
      `"${(f.result?.summary || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `classified_documents_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Export JSON
  const handleExportJson = () => {
    const targetFiles = selectedIds.length > 0
      ? files.filter(f => selectedIds.includes(f.id))
      : filteredFiles;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(targetFiles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `classified_documents_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6" id="data-library-container">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-400" />
            <span>Classified Document Dataset Library</span>
          </h1>
          <p className="text-xs text-slate-400">
            Search, filter, inspect, and export all documents ingested under the active schema
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none w-56"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {taxonomy.categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="classified">Classified</option>
            <option value="flagged_review">Flagged for Review</option>
            <option value="corrected">Human Corrected</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{selectedIds.length} selected</span>
            <button
              onClick={() => {
                onBulkDelete(selectedIds);
                setSelectedIds([]);
              }}
              className="flex items-center gap-1 rounded-lg bg-rose-600/20 border border-rose-500/40 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-600/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="p-4 w-10">
                <button onClick={handleToggleSelectAll} className="text-slate-400 hover:text-white">
                  {selectedIds.length === filteredFiles.length && filteredFiles.length > 0 ? (
                    <CheckSquare className="h-4 w-4 text-indigo-400" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="py-4 px-3 cursor-pointer" onClick={() => { setSortBy('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                <div className="flex items-center gap-1">
                  <span>File Name</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-4 px-3">Class / Taxonomy Code</th>
              <th className="py-4 px-3 cursor-pointer" onClick={() => { setSortBy('confidence'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                <div className="flex items-center gap-1">
                  <span>Confidence</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-4 px-3 cursor-pointer" onClick={() => { setSortBy('risk'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                <div className="flex items-center gap-1">
                  <span>Risk Score</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-4 px-3">Status</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredFiles.map((file) => {
              const isSelected = selectedIds.includes(file.id);
              const cat = taxonomy.categories.find(c => c.id === file.result?.categoryId);
              const catColor = cat?.color || '#6366f1';

              return (
                <tr key={file.id} className={`hover:bg-slate-950/40 transition-colors ${isSelected ? 'bg-indigo-950/20' : ''}`}>
                  <td className="p-4">
                    <button onClick={() => handleToggleSelect(file.id)} className="text-slate-400 hover:text-white">
                      {isSelected ? <CheckSquare className="h-4 w-4 text-indigo-400" /> : <Square className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="py-3 px-3 font-semibold text-white max-w-[240px] truncate">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span 
                      className="rounded-lg px-2.5 py-1 text-[11px] font-bold"
                      style={{ backgroundColor: `${catColor}20`, color: catColor }}
                    >
                      {file.result?.categoryName || 'Unclassified'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {file.result ? (
                      <span className="font-mono font-bold text-cyan-400">
                        {file.result.confidence.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {file.result ? (
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        file.result.riskScore > 6 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {file.result.riskScore}/10
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                      {file.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectFileToInspect(file)}
                        className="rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => onDeleteFile(file.id)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

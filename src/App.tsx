import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ClassifyIngestView } from './components/ClassifyIngestView';
import { DataVisualizerView } from './components/DataVisualizerView';
import { ActiveLearningView } from './components/ActiveLearningView';
import { TaxonomyConfigView } from './components/TaxonomyConfigView';
import { DataLibraryView } from './components/DataLibraryView';
import { FileInspectorModal } from './components/FileInspectorModal';
import { SyntheticDocModal } from './components/SyntheticDocModal';
import { NavigationTab, FileItem, TaxonomySchema } from './types';
import { defaultTaxonomies, initialSampleFiles } from './data/presets';
import { classifyFileItem } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('classify');
  
  // Taxonomies state with local storage fallback
  const [taxonomies, setTaxonomies] = useState<TaxonomySchema[]>(() => {
    const saved = localStorage.getItem('classifylearn_taxonomies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return defaultTaxonomies;
  });

  const [activeTaxonomyId, setActiveTaxonomyId] = useState<string>(() => {
    return defaultTaxonomies[0].id;
  });

  // Current active taxonomy object
  const activeTaxonomy = taxonomies.find(t => t.id === activeTaxonomyId) || taxonomies[0];

  // Files state
  const [files, setFiles] = useState<FileItem[]>(() => {
    const saved = localStorage.getItem('classifylearn_files');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialSampleFiles;
  });

  // Inspection Modal state
  const [inspectingFile, setInspectingFile] = useState<FileItem | null>(null);

  // Synthetic Generator Modal state
  const [isSyntheticModalOpen, setIsSyntheticModalOpen] = useState(false);

  // Batch classification processing indicator
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Save to localStorage when files or taxonomies change
  useEffect(() => {
    localStorage.setItem('classifylearn_taxonomies', JSON.stringify(taxonomies));
  }, [taxonomies]);

  useEffect(() => {
    localStorage.setItem('classifylearn_files', JSON.stringify(files));
  }, [files]);

  // Read raw text from uploaded File objects
  const handleUploadFiles = async (uploadedFiles: File[]) => {
    const newItems: FileItem[] = [];

    for (const file of uploadedFiles) {
      let contentSnippet = `File: ${file.name} (Type: ${file.type || 'binary/doc'}, Size: ${file.size} bytes)`;
      
      // If it's a text-based or readable format, extract snippet
      if (
        file.type.includes('text') || 
        file.type.includes('json') || 
        file.name.endsWith('.txt') || 
        file.name.endsWith('.csv') || 
        file.name.endsWith('.json') ||
        file.name.endsWith('.md')
      ) {
        try {
          const text = await file.text();
          contentSnippet = text.slice(0, 1500);
        } catch (e) {
          // ignore
        }
      } else {
        contentSnippet = `[Document Header: ${file.name}]\nFormat: ${file.type || 'application/octet-stream'}\nSize: ${(file.size / 1024).toFixed(1)} KB\nMetadata: Ingested for multi-modal analysis.`;
      }

      newItems.push({
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || 'unknown',
        uploadedAt: new Date().toISOString(),
        contentSnippet: contentSnippet,
        rawContent: contentSnippet,
        status: 'pending',
        tags: ['Direct Ingest', file.type || 'File'],
        source: 'upload'
      });
    }

    setFiles(prev => [...newItems, ...prev]);

    // Automatically trigger classification for pending items
    setTimeout(() => {
      processPendingQueue(newItems);
    }, 100);
  };

  // Handle Manual Text Document Submit
  const handleManualTextSubmit = (title: string, text: string) => {
    const newItem: FileItem = {
      id: `text-${Date.now()}`,
      name: title.endsWith('.txt') ? title : `${title}.txt`,
      size: new Blob([text]).size,
      type: 'text/plain',
      uploadedAt: new Date().toISOString(),
      contentSnippet: text.slice(0, 1500),
      rawContent: text,
      status: 'pending',
      tags: ['Text Snippet', 'Manual'],
      source: 'upload'
    };

    setFiles(prev => [newItem, ...prev]);
    setTimeout(() => {
      processPendingQueue([newItem]);
    }, 100);
  };

  // Load 3 Instant Sample Documents
  const handleQuickSampleLoad = () => {
    const samplePack: FileItem[] = [
      {
        id: `quick-${Date.now()}-1`,
        name: 'Deloitte_Tax_Audit_Engagement_Letter.pdf',
        size: 148200,
        type: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        contentSnippet: 'Deloitte LLP Tax Advisory Services Engagement Letter for Fiscal Year 2026. Scope of work includes international transfer pricing audit, corporate return 1120 filing, and risk assessment for offshore subsidiaries. Agreed professional fee: $45,000.',
        rawContent: 'Deloitte LLP Tax Advisory Services Engagement Letter for Fiscal Year 2026. Scope of work includes international transfer pricing audit, corporate return 1120 filing, and risk assessment for offshore subsidiaries. Agreed professional fee: $45,000.',
        status: 'pending',
        tags: ['Tax', 'Advisory', 'Engagement'],
        source: 'sample'
      },
      {
        id: `quick-${Date.now()}-2`,
        name: 'Employee_Medical_Leave_FMLA_Request.docx',
        size: 84000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedAt: new Date().toISOString(),
        contentSnippet: 'Human Resources Department - Family and Medical Leave Act (FMLA) Formal Request Form. Employee ID: HR-88492. Requesting 6 weeks continuous medical leave under physician care starting next month.',
        rawContent: 'Human Resources Department - Family and Medical Leave Act (FMLA) Formal Request Form. Employee ID: HR-88492. Requesting 6 weeks continuous medical leave under physician care starting next month.',
        status: 'pending',
        tags: ['HR', 'FMLA', 'Medical'],
        source: 'sample'
      },
      {
        id: `quick-${Date.now()}-3`,
        name: 'AWS_Cloud_Infrastructure_Monthly_Invoice_INV99281.pdf',
        size: 212000,
        type: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        contentSnippet: 'Amazon Web Services Inc. Monthly Consolidated Billing Statement. Account No: 884-2910-332. Services: Amazon Elastic Compute Cloud (EC2), Amazon Aurora PostgreSQL, CloudWatch, S3 Storage. Total Amount Due: $14,832.40 USD. Payment terms: Net 30.',
        rawContent: 'Amazon Web Services Inc. Monthly Consolidated Billing Statement. Account No: 884-2910-332. Services: Amazon Elastic Compute Cloud (EC2), Amazon Aurora PostgreSQL, CloudWatch, S3 Storage. Total Amount Due: $14,832.40 USD. Payment terms: Net 30.',
        status: 'pending',
        tags: ['AWS', 'Cloud', 'Billing'],
        source: 'sample'
      }
    ];

    setFiles(prev => [...samplePack, ...prev]);
    setTimeout(() => {
      processPendingQueue(samplePack);
    }, 100);
  };

  // Real-time Queue Processor
  const processPendingQueue = async (targetQueue?: FileItem[]) => {
    const queueToProcess = targetQueue || files.filter(f => f.status === 'pending');
    if (queueToProcess.length === 0 || isProcessingBatch) return;

    setIsProcessingBatch(true);

    for (const item of queueToProcess) {
      // Set status to processing
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing' } : f));

      try {
        const result = await classifyFileItem(item, activeTaxonomy);
        
        // Update with classified result
        setFiles(prev => prev.map(f => {
          if (f.id === item.id) {
            const isFlagged = result.confidence < ((activeTaxonomy.defaultThreshold || 0.75) * 100) || result.riskScore > 6;
            return {
              ...f,
              status: isFlagged ? 'flagged_review' : 'classified',
              result: result
            };
          }
          return f;
        }));
      } catch (err) {
        console.error('Classification failed for', item.name, err);
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'flagged_review' } : f));
      }
    }

    setIsProcessingBatch(false);
  };

  // Update a single file (e.g. after human correction in inspector)
  const handleUpdateFile = (updated: FileItem) => {
    setFiles(prev => prev.map(f => f.id === updated.id ? updated : f));
    if (inspectingFile && inspectingFile.id === updated.id) {
      setInspectingFile(updated);
    }
  };

  // Delete a single file
  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (inspectingFile?.id === fileId) setInspectingFile(null);
  };

  // Bulk Delete
  const handleBulkDelete = (fileIds: string[]) => {
    setFiles(prev => prev.filter(f => !fileIds.includes(f.id)));
  };

  // Bulk Tag
  const handleBulkTag = (fileIds: string[], tag: string) => {
    const cleanTag = tag.trim();
    if (!cleanTag || fileIds.length === 0) return;
    setFiles(prev => prev.map(f => {
      if (fileIds.includes(f.id)) {
        const currentTags = f.tags || [];
        if (!currentTags.includes(cleanTag)) {
          return { ...f, tags: [...currentTags, cleanTag] };
        }
      }
      return f;
    }));
  };

  // Update active taxonomy schema
  const handleUpdateActiveTaxonomy = (updated: TaxonomySchema) => {
    setTaxonomies(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  // Add new synthetic files into the dataset
  const handleAddSyntheticFiles = (newFiles: FileItem[]) => {
    setFiles(prev => [...newFiles, ...prev]);
    setTimeout(() => {
      processPendingQueue(newFiles);
    }, 100);
  };

  // Calculate pending items for badge
  const pendingCount = files.filter(f => f.status === 'pending').length;
  const flaggedCount = files.filter(f => f.status === 'flagged_review' || (f.result && f.result.confidence < 80)).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white antialiased font-sans flex flex-col justify-between">
      
      {/* Top Main Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeTaxonomy={activeTaxonomy}
        taxonomies={taxonomies}
        onSelectTaxonomy={(tax) => setActiveTaxonomyId(tax.id)}
        files={files}
        onOpenSyntheticModal={() => setIsSyntheticModalOpen(true)}
      />

      {/* Main Content Area based on Tab */}
      <main className="flex-1">
        {currentTab === 'classify' && (
          <ClassifyIngestView
            files={files}
            activeTaxonomy={activeTaxonomy}
            onUploadFiles={handleUploadFiles}
            onClassifyPending={() => processPendingQueue()}
            onSelectFileToInspect={(file) => setInspectingFile(file)}
            onQuickSampleLoad={handleQuickSampleLoad}
            onManualTextSubmit={handleManualTextSubmit}
            isProcessingBatch={isProcessingBatch}
          />
        )}

        {currentTab === 'visualize' && (
          <DataVisualizerView
            files={files}
            taxonomy={activeTaxonomy}
            onSelectFileToInspect={(file) => setInspectingFile(file)}
          />
        )}

        {currentTab === 'active-learning' && (
          <ActiveLearningView
            files={files}
            taxonomy={activeTaxonomy}
            onUpdateFile={handleUpdateFile}
            onSelectFileToInspect={(file) => setInspectingFile(file)}
            onAddBatchFiles={handleAddSyntheticFiles}
          />
        )}

        {currentTab === 'configure' && (
          <TaxonomyConfigView
            activeTaxonomy={activeTaxonomy}
            allTaxonomies={taxonomies}
            onSelectTaxonomy={(t) => setActiveTaxonomyId(t.id)}
            onUpdateTaxonomy={handleUpdateActiveTaxonomy}
          />
        )}

        {currentTab === 'library' && (
          <DataLibraryView
            files={files}
            taxonomy={activeTaxonomy}
            onSelectFileToInspect={(file) => setInspectingFile(file)}
            onDeleteFile={handleDeleteFile}
            onBulkDelete={handleBulkDelete}
            onBulkTag={handleBulkTag}
            onUpdateFile={handleUpdateFile}
          />
        )}
      </main>

      {/* Deep Document Inspector Modal */}
      {inspectingFile && (
        <FileInspectorModal
          file={inspectingFile}
          onClose={() => setInspectingFile(null)}
          taxonomy={activeTaxonomy}
          onUpdateFile={handleUpdateFile}
        />
      )}

      {/* Synthetic Documents Generator Modal */}
      <SyntheticDocModal
        isOpen={isSyntheticModalOpen}
        onClose={() => setIsSyntheticModalOpen(false)}
        taxonomy={activeTaxonomy}
        onAddFiles={handleAddSyntheticFiles}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ClassifyLearn AI • Real-Time Multimodal Document Classification & Latent Visualization</span>
          <div className="flex items-center gap-4">
            <span>Model: Gemini 3.7 Flash</span>
            <span>•</span>
            <span className="font-mono text-cyan-400">Schema: {activeTaxonomy.name} v{activeTaxonomy.version}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

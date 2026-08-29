export interface ExtractedFieldDefinition {
  id: string;
  name: string;
  key: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
}

export interface CategoryRule {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  iconName: string;
  keywords: string[];
  confidenceThreshold: number; // 0 to 1
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiredFields: ExtractedFieldDefinition[];
  exclusionRules?: string;
  exampleSnippets?: string[];
}

export interface TaxonomySchema {
  id: string;
  name: string;
  description: string;
  industry: string;
  version: string;
  defaultThreshold: number;
  strictMode: boolean;
  enableSecondaryClassification: boolean;
  categories: CategoryRule[];
  systemInstructions?: string;
}

export interface ExtractedMetadata {
  [key: string]: any;
}

export interface SecondaryMatch {
  categoryName: string;
  confidence: number;
  reason: string;
}

export interface ClassificationResult {
  categoryId: string;
  categoryName: string;
  confidence: number; // 0 to 100%
  secondaryMatches: SecondaryMatch[];
  summary: string;
  keyEntities: { name: string; type: string }[];
  extractedFields: ExtractedMetadata;
  riskScore: number; // 1 to 10
  urgency: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction: string;
  reasoning: string[];
  clusterCoordinates: { x: number; y: number }; // 2D projection [-100, 100]
  processingTimeMs: number;
  modelUsed: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string; // e.g. 'application/pdf', 'text/plain', 'image/png', 'text/csv', 'application/json'
  uploadedAt: string;
  contentSnippet: string;
  rawContent?: string;
  base64Data?: string;
  status: 'pending' | 'processing' | 'classified' | 'failed' | 'flagged_review' | 'corrected';
  result?: ClassificationResult;
  userOverrideCategory?: string;
  userNotes?: string;
  tags: string[];
  source: 'upload' | 'synthetic' | 'sample' | 'api';
}

export type NavigationTab = 'classify' | 'visualize' | 'active-learning' | 'configure' | 'library';

export interface VisualFilter {
  category: string;
  confidenceMin: number;
  searchQuery: string;
  fileType: string;
  urgency: string;
  status: string;
  dateRange: string;
}

export interface ActiveLearningStats {
  totalFiles: number;
  highConfidenceCount: number;
  reviewRequiredCount: number;
  correctedCount: number;
  averageConfidence: number;
  averageLatencyMs: number;
  categoryCounts: Record<string, number>;
}

import { TaxonomySchema, ClassificationResult, FileItem } from '../types';

export async function checkServerHealth(): Promise<{ status: string; aiEngine: string }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', aiEngine: 'Local Heuristic Engine' };
  }
}

export async function classifyFileWithAI(
  file: Partial<FileItem>,
  taxonomy: TaxonomySchema
): Promise<ClassificationResult> {
  const response = await fetch('/api/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file, taxonomy }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Classification request failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return await response.json();
}

export const classifyFileItem = classifyFileWithAI;

export async function generateSyntheticDocuments(
  category: any,
  count: number = 2,
  complexity: string = 'standard'
): Promise<Array<{
  fileName: string;
  fileType: string;
  content: string;
  simulatedSize: number;
  expectedConfidence: number;
  tags: string[];
}>> {
  const response = await fetch('/api/generate-synthetic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, count, complexity }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate synthetic documents');
  }

  const data = await response.json();
  return data.documents || [];
}

export async function optimizeTaxonomyRules(taxonomy: TaxonomySchema): Promise<{
  enhancedSystemInstructions: string;
  categoryRecommendations: Array<{
    categoryName: string;
    additionalKeywords: string[];
    suggestedExclusionRule: string;
  }>;
  overallScore: number;
  summaryOfImprovements: string;
}> {
  const response = await fetch('/api/optimize-taxonomy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taxonomy }),
  });

  if (!response.ok) {
    throw new Error('Failed to optimize taxonomy');
  }

  return await response.json();
}

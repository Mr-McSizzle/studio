
'use server';
/**
 * @fileOverview An AI tool providing marketing strategy advice.
 *
 * - aiMarketingGuruTool - The Genkit tool definition.
 */

import {ai} from '@/ai/genkit';
import { 
  MarketingGuruToolInputSchema, // This schema name will be refactored to Maya's
  type MayaTheMarketingGuruToolInput as MarketingGuruToolInput, // Temporarily use new type name
  MayaTheMarketingGuruToolOutputSchema as MarketingGuruToolOutputSchema, // Temporarily use new type name
  type MayaTheMarketingGuruToolOutput as MarketingGuruToolOutput // Temporarily use new type name
} from '@/types/simulation';

// This tool is deprecated and will be replaced by mayaTheMarketingGuruTool.
// For now, it points to Maya's schemas and logic.
// It should be removed once all references are updated.
export const aiMarketingGuruTool = ai.defineTool(
  {
    name: 'aiMarketingGuruTool',
    description: 'DEPRECATED: Provides marketing strategy advice. Use mayaTheMarketingGuruTool instead.',
    inputSchema: MarketingGuruToolInputSchema,
    outputSchema: MarketingGuruToolOutputSchema,
  },
  async (input: MarketingGuruToolInput): Promise<MarketingGuruToolOutput> => {
     return { advice: "This tool (aiMarketingGuruTool) is deprecated. Maya the Marketing Guru is now handling marketing advice." };
  }
);


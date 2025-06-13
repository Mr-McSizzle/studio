
'use server';
/**
 * @fileOverview An AI tool providing advice on market expansion.
 *
 * - aiExpansionExpertTool - The Genkit tool definition.
 */

import {ai} from '@/ai/genkit';
import { 
  LeoTheExpansionExpertToolInputSchema as ExpansionExpertToolInputSchema, // Temporarily use new type name
  type LeoTheExpansionExpertToolInput as ExpansionExpertToolInput, // Temporarily use new type name
  LeoTheExpansionExpertToolOutputSchema as ExpansionExpertToolOutputSchema, // Temporarily use new type name
  type LeoTheExpansionExpertToolOutput as ExpansionExpertToolOutput // Temporarily use new type name
} from '@/types/simulation';


// This tool is deprecated and will be replaced by leoTheExpansionExpertTool.
// For now, it points to Leo's schemas and logic.
// It should be removed once all references are updated.
export const aiExpansionExpertTool = ai.defineTool(
  {
    name: 'aiExpansionExpertTool',
    description: 'DEPRECATED: Provides advice on market expansion. Use leoTheExpansionExpertTool instead.',
    inputSchema: ExpansionExpertToolInputSchema,
    outputSchema: ExpansionExpertToolOutputSchema,
  },
  async (input: ExpansionExpertToolInput): Promise<ExpansionExpertToolOutput> => {
    return { advice: "This tool (aiExpansionExpertTool) is deprecated. Leo the Expansion Expert is now handling expansion advice." };
  }
);


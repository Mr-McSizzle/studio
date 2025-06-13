
'use server';
/**
 * @fileOverview An AI tool for providing financial summaries.
 *
 * - aiAccountantTool - The Genkit tool definition.
 */

import {ai} from '@/ai/genkit';
import { 
  AccountantToolInputZodSchema, 
  type AccountantToolInput, 
  AccountantToolOutputZodSchema,
  type AccountantToolOutput
} from '@/types/simulation';

// This tool is deprecated and replaced by alexTheAccountantTool.
// It is kept here temporarily to avoid build errors if it's still imported,
// but it should be removed once all references are updated.
export const aiAccountantTool = ai.defineTool(
  {
    name: 'aiAccountantTool',
    description: 'DEPRECATED: Provides a financial health check. Use alexTheAccountantTool instead.',
    inputSchema: AccountantToolInputZodSchema,
    outputSchema: AccountantToolOutputZodSchema,
  },
  async (input: AccountantToolInput): Promise<AccountantToolOutput> => {
    return { summary: "This tool is deprecated. Please use Alex the Accountant." };
  }
);


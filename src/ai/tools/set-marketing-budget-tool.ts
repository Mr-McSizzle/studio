
'use server';
/**
 * @fileOverview A Genkit tool for EVE to acknowledge setting the marketing budget.
 * The actual store update is handled client-side after EVE's confirmation.
 */

import {ai} from '@/ai/genkit';
import { 
  SetMarketingBudgetToolInputSchema, 
  SetMarketingBudgetToolOutputSchema, 
  type SetMarketingBudgetToolInput 
} from '@/types/simulation';

export const setMarketingBudgetTool = ai.defineTool(
  {
    name: 'setMarketingBudgetTool',
    description: 'Acknowledges a user\'s request to set the monthly marketing budget for the simulation. EVE uses this to confirm the amount before the system applies it. Only use if the user explicitly requests a change to the marketing budget and specifies a new numerical amount.',
    inputSchema: SetMarketingBudgetToolInputSchema,
    outputSchema: SetMarketingBudgetToolOutputSchema,
  },
  async (input: SetMarketingBudgetToolInput) => {
    // This tool doesn't change the store directly.
    // It just acknowledges the request.
    // The ChatInterface will handle the actual store update based on EVE's confirmation.
    return {
      success: true,
      message: `Marketing budget change to ${input.currencyCode || ''}${input.newBudget.toLocaleString()} acknowledged by tool. EVE will confirm application.`,
      newBudget: input.newBudget,
      currencyCode: input.currencyCode,
    };
  }
);

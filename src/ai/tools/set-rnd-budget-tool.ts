
'use server';
/**
 * @fileOverview A Genkit tool for EVE to acknowledge setting the R&D budget.
 * The actual store update is handled client-side after EVE's confirmation.
 */

import {ai} from '@/ai/genkit';
import { 
  SetRnDBudgetToolInputSchema, 
  SetRnDBudgetToolOutputSchema, 
  type SetRnDBudgetToolInput 
} from '@/types/simulation';

export const setRnDBudgetTool = ai.defineTool(
  {
    name: 'setRnDBudgetTool',
    description: 'Acknowledges a user\'s request to set the monthly R&D (Research and Development) budget for the simulation. EVE uses this to confirm the amount before the system applies it. Only use if the user explicitly requests a change to the R&D budget and specifies a new numerical amount.',
    inputSchema: SetRnDBudgetToolInputSchema,
    outputSchema: SetRnDBudgetToolOutputSchema,
  },
  async (input: SetRnDBudgetToolInput) => {
    return {
      success: true,
      message: `R&D budget change to ${input.currencyCode || ''}${input.newBudget.toLocaleString()} acknowledged by tool. EVE will confirm application.`,
      newBudget: input.newBudget,
      currencyCode: input.currencyCode,
    };
  }
);

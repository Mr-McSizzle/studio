
'use server';
/**
 * @fileOverview A Genkit tool for EVE to acknowledge setting the product price.
 * The actual store update is handled client-side after EVE's confirmation.
 */

import {ai} from '@/ai/genkit';
import { 
  SetProductPriceToolInputSchema, 
  SetProductPriceToolOutputSchema, 
  type SetProductPriceToolInput 
} from '@/types/simulation';

export const setProductPriceTool = ai.defineTool(
  {
    name: 'setProductPriceTool',
    description: 'Acknowledges a user\'s request to set the monthly price per user for the product in the simulation. EVE uses this to confirm the amount before the system applies it. Only use if the user explicitly requests a change to the product price and specifies a new numerical amount.',
    inputSchema: SetProductPriceToolInputSchema,
    outputSchema: SetProductPriceToolOutputSchema,
  },
  async (input: SetProductPriceToolInput) => {
    return {
      success: true,
      message: `Product price change to ${input.currencyCode || ''}${input.newPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per user acknowledged by tool. EVE will confirm application.`,
      newPrice: input.newPrice,
      currencyCode: input.currencyCode,
    };
  }
);

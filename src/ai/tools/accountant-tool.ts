
'use server';
/**
 * @fileOverview An AI tool for providing financial summaries.
 *
 * - aiAccountantTool - The Genkit tool definition.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  AccountantToolInputZodSchema, 
  type AccountantToolInput, 
  AccountantToolOutputZodSchema,
  type AccountantToolOutput
} from '@/types/simulation';

export const aiAccountantTool = ai.defineTool(
  {
    name: 'aiAccountantTool',
    description: 'Provides a financial health check and summary based on current simulation data. Use this when the user asks for the AI Accountant\'s opinion or specific financial details like runway or profit margins.',
    inputSchema: AccountantToolInputZodSchema,
    outputSchema: AccountantToolOutputZodSchema,
  },
  async (input: AccountantToolInput): Promise<AccountantToolOutput> => {
    let summary = "The AI Accountant is reviewing your figures. ";
    const { cashOnHand, burnRate, monthlyRevenue, monthlyExpenses, simulationMonth } = input;

    if (typeof cashOnHand === 'number' && typeof burnRate === 'number' && burnRate > 0) {
      const runwayMonths = Math.floor(cashOnHand / burnRate);
      summary += `With $${cashOnHand.toLocaleString()} cash and a $${burnRate.toLocaleString()} monthly burn rate, your estimated runway is approximately ${runwayMonths} months. `;
    } else if (typeof cashOnHand === 'number') {
      summary += `You have $${cashOnHand.toLocaleString()} cash on hand. Burn rate information is needed for a full runway calculation. `;
    } else {
        summary += `Cash on hand or burn rate information is incomplete for runway calculation. `;
    }

    if (typeof monthlyRevenue === 'number' && typeof monthlyExpenses === 'number') {
      const profit = monthlyRevenue - monthlyExpenses;
      if (profit > 0) {
        summary += `This month, you are profitable with $${profit.toLocaleString()} in net profit. `;
      } else {
        summary += `This month, you have a net loss of $${Math.abs(profit).toLocaleString()}. `;
      }
      if (monthlyRevenue > 0) { 
        const profitMargin = (profit / monthlyRevenue) * 100;
        summary += `Your profit margin is ${profitMargin.toFixed(1)}%. `;
      } else if (profit < 0) {
        summary += `No revenue to calculate a profit margin against the loss. `;
      }
    } else {
        summary += `Monthly revenue or expense data is incomplete for profit analysis. `;
    }
    
    if (summary === "The AI Accountant is reviewing your figures. ") { // Fallback if no specific data points hit
        summary = "The AI Accountant needs more specific financial data (cash, burn rate, revenue, expenses) to provide a detailed summary. ";
    }
    
    if (typeof simulationMonth === 'number' && simulationMonth >= 0) { // Check if simulationMonth is a valid number
        summary += `This analysis pertains to simulation month ${simulationMonth}.`;
    } else {
        summary += `Simulation month information is not available for this analysis.`;
    }


    return { summary };
  }
);

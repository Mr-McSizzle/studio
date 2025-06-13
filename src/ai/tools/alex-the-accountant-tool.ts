
'use server';
/**
 * @fileOverview Alex, the AI Accountant tool, providing financial summaries and advice.
 *
 * - alexTheAccountantTool - The Genkit tool definition for Alex.
 */

import {ai} from '@/ai/genkit';
import { 
  AlexTheAccountantToolInputSchema, 
  type AlexTheAccountantToolInput, 
  AlexTheAccountantToolOutputSchema,
  type AlexTheAccountantToolOutput
} from '@/types/simulation'; // Updated to use new schema names

export const alexTheAccountantTool = ai.defineTool(
  {
    name: 'alexTheAccountantTool',
    description: 'Provides a financial health check, budget allocation advice, cash flow analysis, and financial planning insights. Use this when the user asks for Alex (the AI Accountant\'s) opinion or specific financial details like runway or profit margins. Ensure you provide the currencySymbol in your output.',
    inputSchema: AlexTheAccountantToolInputSchema,
    outputSchema: AlexTheAccountantToolOutputSchema,
  },
  async (input: AlexTheAccountantToolInput): Promise<AlexTheAccountantToolOutput> => {
    let summary = "Alex, your AI Accountant, is reviewing your figures. ";
    const { cashOnHand, burnRate, monthlyRevenue, monthlyExpenses, simulationMonth, currencySymbol = '$', query } = input;

    if (query) {
      summary += `Regarding your query: "${query}"... `;
      // Basic response based on query
      if (query.toLowerCase().includes("budget allocation")) {
        summary += "For budget allocation, prioritize areas driving growth while managing cash flow. Consider the 50/30/20 rule for core/growth/buffer as a starting point, adjusted for your startup stage. ";
      } else if (query.toLowerCase().includes("cash flow")) {
        summary += "Maintaining positive cash flow is critical. Regularly review your inflows and outflows, and forecast diligently. ";
      } else {
        summary += "I'm analyzing that specific request. ";
      }
    }


    if (typeof cashOnHand === 'number' && typeof burnRate === 'number' && burnRate > 0) {
      const runwayMonths = Math.floor(cashOnHand / burnRate);
      summary += `With ${currencySymbol}${cashOnHand.toLocaleString()} cash and a ${currencySymbol}${burnRate.toLocaleString()} monthly burn rate, your estimated runway is approximately ${runwayMonths} months. `;
    } else if (typeof cashOnHand === 'number') {
      summary += `You have ${currencySymbol}${cashOnHand.toLocaleString()} cash on hand. Burn rate information is needed for a full runway calculation. `;
    } else {
        summary += `Cash on hand or burn rate information is incomplete for runway calculation. `;
    }

    if (typeof monthlyRevenue === 'number' && typeof monthlyExpenses === 'number') {
      const profit = monthlyRevenue - monthlyExpenses;
      if (profit > 0) {
        summary += `This month, you are profitable with ${currencySymbol}${profit.toLocaleString()} in net profit. `;
      } else {
        summary += `This month, you have a net loss of ${currencySymbol}${Math.abs(profit).toLocaleString()}. `;
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
    
    if (summary === "Alex, your AI Accountant, is reviewing your figures. " || (query && summary.endsWith("I'm analyzing that specific request. "))) { 
        summary = "Alex, your AI Accountant, needs more specific financial data (cash, burn rate, revenue, expenses) or a clearer query to provide a detailed summary. ";
    }
    
    if (typeof simulationMonth === 'number' && simulationMonth >= 0) { 
        summary += `This analysis pertains to simulation month ${simulationMonth}.`;
    } else {
        summary += `Simulation month information is not available for this analysis.`;
    }

    return { summary };
  }
);

    

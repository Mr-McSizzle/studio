
'use server';
/**
 * @fileOverview The Advisor AI tool, providing strategic advice on industry best practices and competitive analysis.
 *
 * - theAdvisorTool - The Genkit tool definition for The Advisor.
 */

import {ai} from '@/ai/genkit';
import { 
  TheAdvisorToolInputSchema, 
  type TheAdvisorToolInput, 
  TheAdvisorToolOutputSchema,
  type TheAdvisorToolOutput
} from '@/types/simulation';

export const theAdvisorTool = ai.defineTool(
  {
    name: 'theAdvisorTool',
    description: 'Provides strategic advice on industry best practices, competitive analysis, and market positioning. Use this when the user seeks insights from "The Advisor" or asks about broader industry trends or competitor strategies.',
    inputSchema: TheAdvisorToolInputSchema,
    outputSchema: TheAdvisorToolOutputSchema,
  },
  async (input: TheAdvisorToolInput): Promise<TheAdvisorToolOutput> => {
    let advice = "The Advisor is contemplating your strategic position. ";
    const { query, currentIndustry, competitors, startupStage } = input;

    const safeIndustry = currentIndustry || 'your current industry';
    const safeStage = startupStage || 'your current stage';

    if (query.toLowerCase().includes("best practice")) {
      advice += `For a startup in '${safeIndustry}' at the '${safeStage}', a key best practice is to rigorously validate product-market fit before scaling. This involves continuous customer feedback loops and iterative development. Another is maintaining a lean operational model to conserve cash runway.`;
    } else if (query.toLowerCase().includes("competitor") || query.toLowerCase().includes("competition")) {
      if (competitors && competitors.length > 0) {
        advice += `Regarding your competitors (${competitors.join(', ')}): Analyze their strengths and weaknesses. Identify gaps in their offerings that your startup, '${query}', could exploit. For example, if they focus on enterprise, you might target SMBs with a more agile solution. Differentiation is key.`;
      } else {
        advice += `To understand your competitive landscape in '${safeIndustry}', identify direct and indirect competitors. Map out their value propositions, pricing, and target audiences. This will help you carve out a unique market position for '${query}'.`;
      }
    } else if (query.toLowerCase().includes("market positioning") || query.toLowerCase().includes("positioning")) {
      advice += `For market positioning of '${query}' in '${safeIndustry}', clearly articulate your Unique Value Proposition (UVP). What makes you different and better for your target customer compared to alternatives? This UVP should be consistently communicated across all your branding and marketing.`;
    } else {
      advice += `The Advisor suggests: For '${query}' in the '${safeIndustry}' at the '${safeStage}', focus on [Generic Startup Advice like 'customer acquisition and retention' or 'building a scalable product']. Keep a close watch on market trends and be prepared to adapt your strategy.`;
    }
    
    return { advice };
  }
);

    
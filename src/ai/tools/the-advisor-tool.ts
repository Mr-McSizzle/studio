
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
      advice += `For a startup in '${safeIndustry}' at the '${safeStage}', a key best practice is to rigorously validate product-market fit before attempting to scale significantly. This involves continuous customer feedback loops, iterative development based on that feedback, and tracking engagement metrics. Another crucial practice is maintaining a lean operational model to conserve cash runway, especially in early stages. Focus on one or two core customer segments initially rather than trying to be everything to everyone.`;
    } else if (query.toLowerCase().includes("competitor") || query.toLowerCase().includes("competition")) {
      if (competitors && competitors.length > 0) {
        const competitorList = competitors.join(', ');
        advice += `Regarding your competitors (${competitorList}): It's vital to analyze their strengths, weaknesses, pricing strategies, and target audiences. Identify gaps in their offerings or underserved customer segments that your startup, '${query || 'your venture'}', could exploit. Differentiation is key – how will you stand out? Don't just copy; innovate. Consider conducting a SWOT analysis for each major competitor relative to your own capabilities.`;
      } else {
        advice += `To understand your competitive landscape in '${safeIndustry}', first identify direct competitors (offering similar solutions to the same audience) and indirect competitors (solving the same problem in a different way). Map out their value propositions, pricing models, marketing strategies, and customer reviews. This will help you carve out a unique market position for '${query || 'your venture'}' and anticipate potential competitive threats.`;
      }
    } else if (query.toLowerCase().includes("market positioning") || query.toLowerCase().includes("positioning")) {
      advice += `For market positioning of '${query || 'your venture'}' in '${safeIndustry}', clearly articulate your Unique Value Proposition (UVP). What specific problem do you solve for whom, and what makes your solution different and better than alternatives for your target customer? This UVP should be consistently communicated across all your branding, marketing materials, and sales pitches. Consider using a positioning statement: "For [target customer] who [statement of need/opportunity], [product name] is a [product category] that [statement of key benefit/compelling reason to buy]. Unlike [primary competitive alternative], our product [statement of primary differentiation]."`;
    } else {
      advice += `The Advisor suggests: For '${query || 'your venture'}' in the '${safeIndustry}' at the '${safeStage}', focus on [Generic Startup Advice like 'customer acquisition and retention strategies', 'building a scalable and defensible product', or 'developing a strong company culture']. Keep a close watch on market trends, technological advancements, and shifts in customer behavior. Be prepared to adapt your strategy as you learn and grow. What are your top 2-3 strategic priorities right now?`;
    }
    
    return { advice };
  }
);

    

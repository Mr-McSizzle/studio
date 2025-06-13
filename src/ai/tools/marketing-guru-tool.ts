
'use server';
/**
 * @fileOverview An AI tool providing marketing strategy advice.
 *
 * - aiMarketingGuruTool - The Genkit tool definition.
 */

import {ai} from '@/ai/genkit';
import { 
  MarketingGuruToolInputSchema, 
  type MarketingGuruToolInput, 
  MarketingGuruToolOutputSchema,
  type MarketingGuruToolOutput
} from '@/types/simulation';

export const aiMarketingGuruTool = ai.defineTool(
  {
    name: 'aiMarketingGuruTool',
    description: 'Provides specialized marketing strategy advice, campaign ideas, or critiques current marketing efforts. Use this when the user asks for the AI Marketing Guru\'s opinion or guidance on marketing topics.',
    inputSchema: MarketingGuruToolInputSchema,
    outputSchema: MarketingGuruToolOutputSchema,
  },
  async (input: MarketingGuruToolInput): Promise<MarketingGuruToolOutput> => {
    // In a real scenario, this would involve more complex logic or even another LLM call
    // For now, returning mock advice based on the query.
    let advice = "The AI Marketing Guru has considered your query. ";
    if (input.query.toLowerCase().includes("acquisition")) {
      advice += "For user acquisition, a multi-channel approach is often best. Consider content marketing to build organic reach, targeted digital ads for specific demographics, and potentially influencer collaborations if your product fits that model. Always track your Customer Acquisition Cost (CAC) per channel.";
    } else if (input.query.toLowerCase().includes("spend") || input.query.toLowerCase().includes("budget")) {
      advice += "Regarding marketing spend, ensure it's aligned with your current product stage and financial runway. Early on, focus on cost-effective channels and validating your messaging. As you grow and understand your CAC, you can scale spend more confidently. A/B testing different spend levels on various platforms can yield valuable insights.";
    } else if (input.query.toLowerCase().includes("brand")) {
      advice += "Building a strong brand involves consistent messaging, a clear unique selling proposition (USP), and understanding your target audience's values. Engage with your community and gather feedback to refine your brand identity over time.";
    } else {
      advice = "The AI Marketing Guru suggests: Focus on understanding your target audience deeply. Tailor your messaging and channel strategy to where they spend their time and what resonates with them. Consistently measure the impact of your marketing efforts to iterate and improve.";
    }
    
    return { advice };
  }
);

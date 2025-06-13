
'use server';
/**
 * @fileOverview Maya, the AI Marketing Guru tool, providing marketing strategy advice.
 *
 * - mayaTheMarketingGuruTool - The Genkit tool definition for Maya.
 */

import {ai} from '@/ai/genkit';
import { 
  MayaTheMarketingGuruToolInputSchema, 
  type MayaTheMarketingGuruToolInput, 
  MayaTheMarketingGuruToolOutputSchema,
  type MayaTheMarketingGuruToolOutput
} from '@/types/simulation'; // Updated to use new schema names

export const mayaTheMarketingGuruTool = ai.defineTool(
  {
    name: 'mayaTheMarketingGuruTool',
    description: 'Provides specialized marketing strategy advice, go-to-market strategy, brand building, campaign ideas, or critiques current marketing efforts. Use this when the user asks for Maya (the AI Marketing Guru\'s) opinion or guidance on marketing topics.',
    inputSchema: MayaTheMarketingGuruToolInputSchema,
    outputSchema: MayaTheMarketingGuruToolOutputSchema,
  },
  async (input: MayaTheMarketingGuruToolInput): Promise<MayaTheMarketingGuruToolOutput> => {
    let advice = "Maya, your AI Marketing Guru, has considered your query. ";
    const { query, currentMarketingSpend, targetMarketDescription, productStage } = input;

    if (query.toLowerCase().includes("go-to-market") || query.toLowerCase().includes("gtm")) {
      advice += `For your go-to-market strategy, especially at the ${productStage || 'current'} stage targeting ${targetMarketDescription || 'your market'}, focus on channels that offer high engagement with early adopters. Content marketing and targeted community engagement can be very effective. `;
    } else if (query.toLowerCase().includes("brand building")) {
      advice += "Brand building is a marathon, not a sprint. Start with defining your unique value proposition and consistently communicate it across all touchpoints. Storytelling is key. ";
    } else if (query.toLowerCase().includes("campaign ideas")) {
      advice += `For campaign ideas, considering your product stage ('${productStage || 'unknown'}') and budget (current spend: ${currentMarketingSpend || 'not specified'}), perhaps an early-adopter program or a content series addressing key pain points for '${targetMarketDescription || 'your audience'}' could work. `;
    } else if (input.query.toLowerCase().includes("acquisition")) {
      advice += "For user acquisition, a multi-channel approach is often best. Consider content marketing to build organic reach, targeted digital ads for specific demographics, and potentially influencer collaborations if your product fits that model. Always track your Customer Acquisition Cost (CAC) per channel.";
    } else if (input.query.toLowerCase().includes("spend") || input.query.toLowerCase().includes("budget")) {
      advice += "Regarding marketing spend, ensure it's aligned with your current product stage and financial runway. Early on, focus on cost-effective channels and validating your messaging. As you grow and understand your CAC, you can scale spend more confidently. A/B testing different spend levels on various platforms can yield valuable insights.";
    } else {
      advice += "Focus on understanding your target audience deeply. Tailor your messaging and channel strategy to where they spend their time and what resonates with them. Consistently measure the impact of your marketing efforts to iterate and improve.";
    }
    
    return { advice };
  }
);

    
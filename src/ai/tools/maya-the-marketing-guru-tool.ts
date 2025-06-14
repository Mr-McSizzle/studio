
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
      advice += `For your go-to-market strategy, especially at the ${productStage || 'current'} stage targeting ${targetMarketDescription || 'your market'}, focus on channels that offer high engagement with early adopters. Content marketing (blog posts, short videos addressing pain points) and targeted community engagement (relevant forums, social groups) can be very effective initially. Measure your Customer Acquisition Cost (CAC) per channel.`;
    } else if (query.toLowerCase().includes("brand building")) {
      advice += "Brand building is a marathon, not a sprint. Start by clearly defining your unique value proposition (UVP) and consistently communicate it across all touchpoints (website, social media, ads, customer interactions). Storytelling is key – what's the narrative behind your brand? What problem do you solve better than anyone else? ";
    } else if (query.toLowerCase().includes("campaign ideas")) {
      advice += `For campaign ideas, considering your product stage ('${productStage || 'unknown'}') and budget (current spend: ${currentMarketingSpend ? '$'+currentMarketingSpend : 'not specified'}), here are a couple:
1.  **Early Adopter Program:** Offer exclusive access or discounts to a select group of users in your '${targetMarketDescription || 'audience'}' in exchange for feedback. Promote this through targeted outreach or niche communities.
2.  **Problem/Solution Content Series:** Create a series of short articles or videos highlighting a key pain point for '${targetMarketDescription || 'your audience'}' and how your product solves it. Share these across relevant social channels.
Remember to define clear goals and KPIs for any campaign.`;
    } else if (query.toLowerCase().includes("acquisition")) {
      advice += `For user acquisition for a product at the '${productStage || 'current'}' stage targeting '${targetMarketDescription || 'your market'}', a multi-channel approach is often best. 
- **Content Marketing:** SEO-optimized blog posts, helpful guides, or case studies to build organic reach.
- **Targeted Digital Ads:** Platforms like LinkedIn (for B2B) or Facebook/Instagram (for B2C) allow precise targeting of '${targetMarketDescription || 'your audience'}'. Start with small test budgets to find what works.
- **Influencer/Community Collaborations:** If your product fits, partnering with relevant micro-influencers or active members in communities frequented by '${targetMarketDescription || 'your audience'}' can be effective.
Always track your Customer Acquisition Cost (CAC) per channel to optimize spend.`;
    } else if (query.toLowerCase().includes("spend") || query.toLowerCase().includes("budget")) {
      advice += `Regarding marketing spend (currently ${currentMarketingSpend ? '$'+currentMarketingSpend : 'not specified'}), ensure it's aligned with your '${productStage || 'current product'}' stage and financial runway. 
- **Early Stage (Idea/MVP):** Focus on cost-effective channels (content, organic social, community engagement) and validating your messaging. Spend should be minimal and focused on learning.
- **Growth Stage:** As you understand your CAC and LTV (Lifetime Value), you can scale spend more confidently on proven channels. A/B testing different spend levels on various platforms can yield valuable insights.
Consider allocating a small percentage (e.g., 10-15%) of your budget for experimental channels.`;
    } else {
      advice += `Focus on understanding your target audience ('${targetMarketDescription || 'your market'}') deeply. Tailor your messaging and channel strategy to where they spend their time and what resonates with them. Consistently measure the impact of your marketing efforts (website traffic, conversion rates, CAC) to iterate and improve. What specific marketing challenge are you facing today?`;
    }
    
    return { advice };
  }
);

    

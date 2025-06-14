
'use server';
/**
 * @fileOverview Leo, the AI Expansion Expert tool, providing advice on market expansion and scaling.
 *
 * - leoTheExpansionExpertTool - The Genkit tool definition for Leo.
 */

import {ai} from '@/ai/genkit';
import { 
  LeoTheExpansionExpertToolInputSchema, 
  type LeoTheExpansionExpertToolInput, 
  LeoTheExpansionExpertToolOutputSchema,
  type LeoTheExpansionExpertToolOutput
} from '@/types/simulation'; // Updated to use new schema names

export const leoTheExpansionExpertTool = ai.defineTool(
  {
    name: 'leoTheExpansionExpertTool',
    description: 'Provides specialized advice on market expansion strategies, scaling operations, internationalization, partnerships, and managing associated risks. Use this when the user asks for Leo (the AI Expansion Expert\'s) opinion or guidance on these topics.',
    inputSchema: LeoTheExpansionExpertToolInputSchema,
    outputSchema: LeoTheExpansionExpertToolOutputSchema,
  },
  async (input: LeoTheExpansionExpertToolInput): Promise<LeoTheExpansionExpertToolOutput> => {
    let advice = "Leo, your AI Expansion Expert, is evaluating your potential. ";
    const { query, currentScale, targetExpansion } = input;

    if (query.toLowerCase().includes("new market") || query.toLowerCase().includes("different segment")) {
      advice += `Entering a new market segment, especially if you're aiming for '${targetExpansion || 'significant growth'}', requires thorough research. Understand the specific needs, pain points, and competitive landscape of that segment. Your product may need adaptation. A pilot program or a localized MVP for the new segment can be a good way to test the waters before full commitment. Consider regulatory and cultural differences if the new market is geographically distinct.`;
    } else if (query.toLowerCase().includes("international") || query.toLowerCase().includes("global")) {
      advice += `International expansion towards '${targetExpansion || 'global reach'}' is complex. Consider legal, cultural, and logistical differences. Financial readiness is key, as international efforts often have higher upfront costs. Start with one or two target countries that have strong product-market fit indicators or lower barriers to entry. Local partnerships can be invaluable.`;
    } else if (query.toLowerCase().includes("scaling operations")) {
      advice += `When scaling operations from '${currentScale || 'your current size'}' to handle '${targetExpansion || 'increased demand'}', it's crucial that your foundational processes (customer support, infrastructure, supply chain, team structure) can cope. Automate repetitive tasks, invest in scalable technologies, and clearly define roles and responsibilities. Monitor key operational metrics closely.`;
    } else if (query.toLowerCase().includes("partnerships")) {
      advice += "Strategic partnerships can accelerate growth by providing access to new customers, technologies, or distribution channels. Identify potential partners whose offerings complement yours and who share a similar target audience or values. Ensure clear terms, mutual benefits, and a well-defined governance structure for the partnership. Start with smaller, pilot collaborations to test compatibility. ";
    } else if (query.toLowerCase().includes("risk")) {
      advice += "Key risks in expansion include misjudging market demand, operational overstretch, cultural missteps (especially internationally), increased competition, and financial strain. Mitigation involves deep market research, phased rollouts, building a strong and adaptable team, maintaining financial flexibility, and developing contingency plans for common scenarios.";
    } else {
      advice = "Leo advises: Before any expansion, clearly define your objectives and KPIs. Ensure it aligns with your core business strategy and that you have the resources (financial, human, technological). Validate assumptions about the new market or scale with data, not just gut feeling. What specific area of expansion are you most concerned about?";
    }
    
    return { advice };
  }
);

    

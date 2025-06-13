
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
      advice += `Entering a new market segment, especially if you're aiming for '${targetExpansion || 'significant growth'}', requires thorough research. Understand the specific needs, pain points, and competitive landscape of that segment. Your product may need adaptation. A pilot program can be a good way to test the waters.`;
    } else if (query.toLowerCase().includes("international") || query.toLowerCase().includes("global")) {
      advice += `International expansion towards '${targetExpansion || 'global reach'}' is complex. Consider legal, cultural, and logistical differences. Financial readiness is key. Start with one or two target countries.`;
    } else if (query.toLowerCase().includes("scaling operations")) {
      advice += `When scaling operations from '${currentScale || 'your current size'}' to handle '${targetExpansion || 'increased demand'}', it's crucial that your foundational processes (customer support, infrastructure) can cope. Automate repetitive tasks and define roles clearly.`;
    } else if (query.toLowerCase().includes("partnerships")) {
      advice += "Strategic partnerships can accelerate growth. Identify potential partners whose offerings complement yours and who share a similar target audience. Ensure clear terms and mutual benefits. ";
    } else if (query.toLowerCase().includes("risk")) {
      advice += "Key risks in expansion include misjudging market demand, operational overstretch, and cultural missteps. Mitigation involves deep market research, phased rollouts, and maintaining financial flexibility.";
    } else {
      advice = "Leo advises: Before any expansion, clearly define your objectives. Ensure it aligns with your core business strategy and that you have the resources. Validate assumptions about the new market or scale with data.";
    }
    
    return { advice };
  }
);

    
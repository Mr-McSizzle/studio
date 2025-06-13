
'use server';
/**
 * @fileOverview An AI tool providing advice on market expansion.
 *
 * - aiExpansionExpertTool - The Genkit tool definition.
 */

import {ai} from '@/ai/genkit';
import { 
  ExpansionExpertToolInputSchema, 
  type ExpansionExpertToolInput, 
  ExpansionExpertToolOutputSchema,
  type ExpansionExpertToolOutput
} from '@/types/simulation';

export const aiExpansionExpertTool = ai.defineTool(
  {
    name: 'aiExpansionExpertTool',
    description: 'Provides specialized advice on market expansion strategies, assessing new market opportunities, internationalization, and managing associated risks. Use this when the user asks for the AI Expansion Expert\'s opinion or guidance on expansion topics.',
    inputSchema: ExpansionExpertToolInputSchema,
    outputSchema: ExpansionExpertToolOutputSchema,
  },
  async (input: ExpansionExpertToolInput): Promise<ExpansionExpertToolOutput> => {
    let advice = "The AI Expansion Expert is evaluating your expansion potential. ";
    if (input.query.toLowerCase().includes("new market") || input.query.toLowerCase().includes("different segment")) {
      advice += "Entering a new market segment requires thorough research. Understand the specific needs, pain points, and competitive landscape of that segment. Your product may need adaptation. A pilot program or a small-scale launch can be a good way to test the waters before committing significant resources.";
    } else if (input.query.toLowerCase().includes("international") || input.query.toLowerCase().includes("global")) {
      advice += "International expansion is complex. Consider legal and regulatory differences, cultural nuances, language barriers, and logistical challenges. Financial readiness is key, as international expansion often requires substantial upfront investment. Start with one or two target countries rather than a broad approach.";
    } else if (input.query.toLowerCase().includes("risk")) {
      advice += "Key risks in expansion include misjudging market demand, underestimating competition, operational overstretch, and cultural missteps. Mitigation involves deep market research, phased rollouts, building local partnerships if applicable, and maintaining financial flexibility.";
    } else {
      advice = "The AI Expansion Expert advises: Before any expansion, clearly define your objectives and ensure it aligns with your core business strategy. Validate assumptions about the new market with data, not just intuition. Be prepared to adapt your product, marketing, and operations to suit the new environment.";
    }
    
    return { advice };
  }
);

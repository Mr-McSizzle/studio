
'use server';
/**
 * @fileOverview An AI flow for The Advisor to provide competitor analysis.
 * (Placeholder - detailed prompt and logic to be implemented)
 *
 * - competitorAnalysis - Function to call the AI flow.
 * - CompetitorAnalysisInput - Input type for the flow.
 * - CompetitorAnalysisOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import { CompetitorAnalysisInputSchema, CompetitorAnalysisOutputSchema, type CompetitorAnalysisInput, type CompetitorAnalysisOutput } from '@/types/simulation';

export async function competitorAnalysis(input: CompetitorAnalysisInput): Promise<CompetitorAnalysisOutput> {
  return competitorAnalysisGenkitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'competitorAnalysisPrompt',
  input: { schema: CompetitorAnalysisInputSchema },
  output: { schema: CompetitorAnalysisOutputSchema },
  config: {
    temperature: 0.6,
  },
  prompt: `You are The Advisor for ForgeSim, specializing in competitive strategy.
The user wants an analysis of their competitors.

User's Current Simulation State (JSON):
{{{simulationStateJSON}}}

User's Target Market Description:
"{{#if marketDescription}}{{{marketDescription}}}{{else}}Not explicitly provided.{{/if}}"

Competitors to Analyze:
{{#each competitorsToAnalyze}}
- Name: {{{name}}}
  {{#if productOffering}}Product/Service: {{{productOffering}}}{{/if}}
  {{#if strengths}}Known Strengths: {{#each strengths}}"{{{this}}}"{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
  {{#if weaknesses}}Known Weaknesses: {{#each weaknesses}}"{{{this}}}"{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{/each}}

Based on this information, provide:
1.  **overallMarketPerspective**: A brief overview of the competitive landscape.
2.  **detailedAnalyses**: For each competitor:
    *   competitorName
    *   aiAssessedStrengths: Your assessment of their key strengths.
    *   aiAssessedWeaknesses: Your assessment of their key weaknesses.
    *   potentialThreatsToUser: How this competitor might threaten the user's startup.
    *   potentialOpportunitiesForUser: Opportunities for the user related to this competitor.
    *   strategicConsiderations: Overall strategic points regarding this competitor.
3.  **strategicRecommendations**: High-level recommendations for the user's startup.

The output MUST be a single JSON object matching the CompetitorAnalysisOutputSchema.
{{output}}
`
});

const competitorAnalysisGenkitFlow = ai.defineFlow(
  {
    name: 'competitorAnalysisGenkitFlow',
    inputSchema: CompetitorAnalysisInputSchema,
    outputSchema: CompetitorAnalysisOutputSchema,
  },
  async (input: CompetitorAnalysisInput): Promise<CompetitorAnalysisOutput> => {
    const {output} = await prompt(input);

    if (!output || !output.overallMarketPerspective || !Array.isArray(output.detailedAnalyses)) {
      console.error("AI competitorAnalysisFlow did not return the expected structure.", output);
      return { 
        overallMarketPerspective: "Error: AI failed to generate market perspective.",
        detailedAnalyses: [{ competitorName: "N/A", aiAssessedStrengths: [], aiAssessedWeaknesses: [], potentialThreatsToUser: [], potentialOpportunitiesForUser: [], strategicConsiderations: "Analysis failed." }],
        strategicRecommendations: ["Could not generate recommendations."]
      };
    }
    return output;
  }
);

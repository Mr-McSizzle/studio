
// src/ai/flows/strategy-recommendations.ts
'use server';

/**
 * @fileOverview An AI agent that analyzes simulation data from the "digital twin" 
 * to provide predictive analytics, risk assessment, and actionable strategic recommendations.
 *
 * - getStrategyRecommendations - A function that provides strategic recommendations.
 * - StrategyRecommendationsInput - The input type for the getStrategyRecommendations function.
 * - StrategyRecommendationsOutput - The return type for the getStrategyRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StrategyRecommendationsInputSchema = z.object({
  simulationData: z
    .string()
    .describe(
      'The current state of the "digital twin" simulation data in JSON format. This includes key performance indicators, financial metrics, market conditions, and operational status.'
    ),
});
export type StrategyRecommendationsInput = z.infer<
  typeof StrategyRecommendationsInputSchema
>;

const StrategyRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('Actionable strategic recommendations, including predictive insights, risk assessments, and opportunities for improvement based on the digital twin\'s simulation data. Formatted as a concise, actionable report.'),
});
export type StrategyRecommendationsOutput = z.infer<
  typeof StrategyRecommendationsOutputSchema
>;

export async function getStrategyRecommendations(
  input: StrategyRecommendationsInput
): Promise<StrategyRecommendationsOutput> {
  return strategyRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'strategyRecommendationsPrompt',
  input: {schema: StrategyRecommendationsInputSchema},
  output: {schema: StrategyRecommendationsOutputSchema},
  prompt: `You are an expert business strategist and predictive analyst AI for Inceptico. Your role is to analyze the provided "digital twin" simulation data for a startup and deliver actionable strategic recommendations.

Current Digital Twin Simulation Data:
{{{simulationData}}}

Based on this data, provide a concise report covering:
1.  **Key Performance Insights**: Briefly highlight 2-3 critical positive or negative trends evident in the data.
2.  **Predictive Analysis**: Based on current trajectories, what are 1-2 likely short-to-medium term outcomes or challenges?
3.  **Risk Assessment**: Identify 1-2 significant potential risks (e.g., market shift, competitor action, resource depletion) suggested by the data.
4.  **Strategic Recommendations**: Offer 2-3 clear, actionable recommendations to improve business outcomes, mitigate identified risks, or capitalize on opportunities. These should be specific and tied to the simulation context.

Format your entire response as a single block of text suitable for display in a recommendations card. Use markdown for light formatting (bolding, lists) if it enhances readability, but avoid complex structures.
{{output}}
`,
});

const strategyRecommendationsFlow = ai.defineFlow(
  {
    name: 'strategyRecommendationsFlow',
    inputSchema: StrategyRecommendationsInputSchema,
    outputSchema: StrategyRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.recommendations) {
      console.error("AI strategyRecommendations did not return the expected structure.", output);
      throw new Error("Failed to get complete strategic recommendations from AI. The response was malformed.");
    }
    return output;
  }
);


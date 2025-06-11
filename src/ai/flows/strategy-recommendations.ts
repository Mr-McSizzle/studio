// src/ai/flows/strategy-recommendations.ts
'use server';

/**
 * @fileOverview A strategic recommendation AI agent based on simulation data.
 *
 * - getStrategyRecommendations - A function that provides strategic recommendations based on simulation data.
 * - StrategyRecommendationsInput - The input type for the getStrategyRecommendations function.
 * - StrategyRecommendationsOutput - The return type for the getStrategyRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StrategyRecommendationsInputSchema = z.object({
  simulationData: z
    .string()
    .describe(
      'The simulation data in JSON format, containing various business metrics and outcomes.'
    ),
});
export type StrategyRecommendationsInput = z.infer<
  typeof StrategyRecommendationsInputSchema
>;

const StrategyRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('Actionable strategic recommendations based on the simulation data.'),
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
  prompt: `You are a strategic business consultant. Analyze the provided simulation data and provide actionable strategic recommendations.

Simulation Data: {{{simulationData}}}

Provide clear and concise recommendations to improve business outcomes. Focus on key areas for improvement and data driven decisions.
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
    return output!;
  }
);

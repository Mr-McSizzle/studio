
'use server';
/**
 * @fileOverview An AI flow for Alex the Accountant to provide detailed financial analysis.
 * (Placeholder - detailed prompt and logic to be implemented)
 *
 * - detailedFinancialAnalysis - Function to call the AI flow.
 * - DetailedFinancialAnalysisInput - Input type for the flow.
 * - DetailedFinancialAnalysisOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import { DetailedFinancialAnalysisInputSchema, DetailedFinancialAnalysisOutputSchema, type DetailedFinancialAnalysisInput, type DetailedFinancialAnalysisOutput } from '@/types/simulation';

export async function detailedFinancialAnalysis(input: DetailedFinancialAnalysisInput): Promise<DetailedFinancialAnalysisOutput> {
  return detailedFinancialAnalysisGenkitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detailedFinancialAnalysisPrompt',
  input: { schema: DetailedFinancialAnalysisInputSchema },
  output: { schema: DetailedFinancialAnalysisOutputSchema },
  config: {
    temperature: 0.5,
  },
  prompt: `You are Alex, the AI Accountant for Inceptico. Provide a detailed financial analysis based on the provided simulation data and user query.

Current Simulation State (JSON):
{{{simulationStateJSON}}}

User Query (if any): "{{#if userQuery}}{{{userQuery}}}{{else}}Provide a general financial health assessment.{{/if}}"
Analysis Focus Period: Last {{{analysisPeriodMonths}}} months of data (if available in state).

Based on this, generate a structured financial analysis including:
1.  **analysisSummary**: An overall summary of financial health.
2.  **keyObservations**: List of important trends or points from the data (e.g., "Revenue increased by X% over the last Y months", "Burn rate is accelerating").
3.  **calculatedRatios**: (Optional) Calculate and interpret 2-3 key financial ratios relevant to a startup (e.g., Gross Profit Margin if COGS data were available, Runway, Quick Ratio - make assumptions if necessary or state what's needed). For each ratio:
    *   name: e.g., "Estimated Runway"
    *   value: e.g., "3 months"
    *   interpretation: e.g., "Indicates limited time to reach profitability without new funding."
4.  **recommendations**: (Optional) 1-2 actionable financial recommendations.
5.  **investmentReadiness**: (Optional) If the user query implies it, provide a brief assessment of investment readiness.

The output MUST be a single JSON object matching the DetailedFinancialAnalysisOutputSchema.
{{output}}
`
});

const detailedFinancialAnalysisGenkitFlow = ai.defineFlow(
  {
    name: 'detailedFinancialAnalysisGenkitFlow',
    inputSchema: DetailedFinancialAnalysisInputSchema,
    outputSchema: DetailedFinancialAnalysisOutputSchema,
  },
  async (input: DetailedFinancialAnalysisInput): Promise<DetailedFinancialAnalysisOutput> => {
    const {output} = await prompt(input);

    if (!output || !output.analysisSummary || !Array.isArray(output.keyObservations)) {
      console.error("AI detailedFinancialAnalysisFlow did not return the expected structure.", output);
      return {
        analysisSummary: "Error: AI failed to generate a financial analysis summary.",
        keyObservations: ["Could not retrieve key observations."],
      };
    }
    return output;
  }
);


'use server';
/**
 * @fileOverview An AI flow to analyze a custom "what-if" scenario described by the user,
 * in the context of the current simulation state.
 *
 * - analyzeCustomScenario - Function to call the AI scenario analysis flow.
 * - AnalyzeCustomScenarioInput - Input type for the flow.
 * - AnalyzeCustomScenarioOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod'; // z is from genkit, not directly from 'zod'
import { AnalyzeCustomScenarioInputSchema, AnalyzeCustomScenarioOutputSchema, type AnalyzeCustomScenarioInput, type AnalyzeCustomScenarioOutput } from '@/types/simulation';

export async function analyzeCustomScenario(input: AnalyzeCustomScenarioInput): Promise<AnalyzeCustomScenarioOutput> {
  return analyzeCustomScenarioGenkitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCustomScenarioPrompt',
  input: { schema: AnalyzeCustomScenarioInputSchema },
  output: { schema: AnalyzeCustomScenarioOutputSchema },
  config: {
    temperature: 0.6, 
  },
  prompt: `You are an expert strategic business analyst for ForgeSim. Your task is to analyze a hypothetical "what-if" scenario provided by the user, considering the current state of their simulated business.

Current Simulation State (JSON):
{{{simulationStateJSON}}}

User's Custom "What-If" Scenario:
"{{{customScenarioDescription}}}"

Based on both the current simulation state and the user's scenario, provide a concise analysis covering the following points. Structure your response clearly.

1.  **Scenario Interpretation**: Briefly restate your understanding of the scenario.
2.  **Potential Immediate Impacts**: What are the most likely direct consequences on the business (e.g., revenue, user acquisition, costs, team morale)?
3.  **Key Metrics Affected**: Which specific metrics from the simulation (e.g., Cash on Hand, Active Users, Burn Rate, Churn Rate, Startup Score) would likely see significant changes, and in what direction (positive/negative)?
4.  **Secondary or Longer-Term Effects**: What are potential knock-on effects or challenges that might arise later?
5.  **Opportunities & Risks**: Does this scenario present any hidden opportunities or exacerbate existing risks?
6.  **Strategic Considerations / Questions for the Founder**: What key questions should the founder be asking themselves in light of this scenario? What high-level strategic adjustments might they consider exploring?

Format your entire response as a single block of text suitable for display. Use markdown for light formatting (bolding headings, lists) if it enhances readability.
The output MUST be a single JSON object matching the AnalyzeCustomScenarioOutputSchema.
{{output}}
`
});

const analyzeCustomScenarioGenkitFlow = ai.defineFlow(
  {
    name: 'analyzeCustomScenarioGenkitFlow',
    inputSchema: AnalyzeCustomScenarioInputSchema,
    outputSchema: AnalyzeCustomScenarioOutputSchema,
  },
  async (input: AnalyzeCustomScenarioInput): Promise<AnalyzeCustomScenarioOutput> => {
    const {output} = await prompt(input);

    if (!output || !output.analysisText) {
      console.error("AI analyzeCustomScenarioFlow did not return the expected 'analysisText' field.", output);
      // Try to salvage if output is a string directly
      if (typeof output === 'string') {
        return { analysisText: output as string };
      }
      // Or if output is an object but missing the field, return a diagnostic message
      if (typeof output === 'object' && output !== null) {
        return { analysisText: "Error: AI analysis structure was malformed. Expected 'analysisText' field. Output was: " + JSON.stringify(output) };
      }
      throw new Error("AI scenario analysis failed to produce a valid output structure.");
    }
    
    return output;
  }
);



'use server';
/**
 * @fileOverview An AI flow to suggest relevant "what-if" scenarios based on the current simulation state.
 *
 * - suggestScenarios - Function to call the AI scenario suggestion flow.
 * - SuggestScenariosInput - Input type for the flow.
 * - SuggestScenariosOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod'; // z is from genkit, not directly from 'zod'
import { 
    SuggestScenariosInputSchema, 
    SuggestScenariosOutputSchema, 
    type SuggestScenariosInput, 
    type SuggestScenariosOutput 
} from '@/types/simulation';

export async function suggestScenarios(input: SuggestScenariosInput): Promise<SuggestScenariosOutput> {
  return suggestScenariosGenkitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestScenariosPrompt',
  input: { schema: SuggestScenariosInputSchema },
  output: { schema: SuggestScenariosOutputSchema },
  config: {
    temperature: 0.7, 
  },
  prompt: `You are an expert strategic advisor for Inceptico, a business simulation platform. Your task is to analyze the current state of the user's simulated business and generate 2-3 distinct, plausible, and insightful "what-if" scenarios for them to explore. These scenarios should prompt strategic thinking and cover different aspects like market dynamics, operational challenges, financial situations, or product development hurdles.

Current Simulation State (JSON):
{{{simulationStateJSON}}}

Based on this state, generate a list of 2 to 3 unique scenarios. Each scenario should have:
1.  **id**: A concise, machine-friendly ID (e.g., "competitor_price_war", "supply_chain_disruption_v2").
2.  **label**: A short, user-friendly label (e.g., "Competitor Price War", "Supply Chain Disruption").
3.  **description**: A clear, detailed description of the hypothetical scenario.

Examples of scenario descriptions:
- "A new, well-funded competitor enters your primary market segment offering a similar product at a 30% lower price point. They also launch an aggressive marketing campaign."
- "Your primary supplier for a critical component unexpectedly increases prices by 50% due to global shortages, significantly impacting your cost of goods sold."
- "Your product receives an unsolicited glowing review from a major industry influencer, leading to a sudden 5x surge in organic traffic and sign-up interest over the next two weeks."
- "A key piece of proposed legislation directly impacting your business model (e.g., data privacy changes, new industry-specific tax) passes and will come into effect in 6 months."

The output MUST be a single JSON object matching the SuggestScenariosOutputSchema, containing an array named 'suggestedScenarios'.
{{output}}
`
});

const suggestScenariosGenkitFlow = ai.defineFlow(
  {
    name: 'suggestScenariosGenkitFlow',
    inputSchema: SuggestScenariosInputSchema,
    outputSchema: SuggestScenariosOutputSchema,
  },
  async (input: SuggestScenariosInput): Promise<SuggestScenariosOutput> => {
    const {output} = await prompt(input);

    if (!output || !Array.isArray(output.suggestedScenarios) || output.suggestedScenarios.length === 0) {
      console.error("AI suggestScenariosFlow did not return the expected 'suggestedScenarios' array.", output);
      // Provide a fallback or throw a more specific error
      if (output && typeof output === 'object' && !output.suggestedScenarios) {
        return { suggestedScenarios: [{id: "fallback_error", label: "Error Generating", description: "AI failed to generate scenarios. Output structure malformed."}] };
      }
      throw new Error("AI scenario suggestion failed to produce a valid output structure.");
    }
    
    // Ensure each scenario has the required fields
    for (const scenario of output.suggestedScenarios) {
      if (!scenario.id || !scenario.label || !scenario.description) {
        console.error("Malformed scenario object from AI:", scenario);
        // You could choose to filter out malformed scenarios or throw
        throw new Error("AI returned a scenario object with missing fields.");
      }
    }
    
    return output;
  }
);


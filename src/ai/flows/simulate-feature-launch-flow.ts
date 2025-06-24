
'use server';
/**
 * @fileOverview An AI flow to simulate the launch of a new product or feature.
 *
 * - simulateFeatureLaunch - Function to call the AI simulation flow.
 * - SimulateFeatureLaunchInput - Input type for the flow.
 * - SimulateFeatureLaunchOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {
  SimulateFeatureLaunchInputSchema,
  SimulateFeatureLaunchOutputSchema,
  type SimulateFeatureLaunchInput,
  type SimulateFeatureLaunchOutput,
} from '@/types/simulation';

export async function simulateFeatureLaunch(
  input: SimulateFeatureLaunchInput
): Promise<SimulateFeatureLaunchOutput> {
  return simulateFeatureLaunchGenkitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateFeatureLaunchPrompt',
  input: { schema: SimulateFeatureLaunchInputSchema },
  output: { schema: SimulateFeatureLaunchOutputSchema },
  config: {
    temperature: 0.6,
  },
  prompt: `You are a team of expert AI strategists for Inceptico, comprised of EVE (the Hive Mind), Alex (Accountant), and Maya (Marketing Guru). Your task is to analyze a proposed new feature launch based on the user's current simulation state and provide a comprehensive projection.

**Current Simulation State (JSON):**
{{{simulationStateJSON}}}

**Proposed New Feature/Product Launch:**
- **Feature Name:** {{{featureName}}}
- **Target Audience:** {{{targetAudience}}}
- **Estimated Budget:** {{{estimatedBudget}}}

**Your Analysis Task:**

1.  **Quantitative Projections:**
    *   `projectedUserAdoption`: Estimate the number of existing users who might adopt this feature in the first 3 months. Consider the target audience overlap with the current user base.
    *   `projectedNewUsers`: Estimate the number of *new* users this feature might attract in the first 3 months.
    *   `projectedRevenueImpact`: Estimate the potential monthly recurring revenue (MRR) increase after 3 months. This could be from new users or if the feature is a paid add-on.
    *   `projectedBurnRateChange`: Estimate the increase in monthly burn rate due to the feature's budget (development, marketing) and ongoing maintenance.

2.  **Qualitative Feedback:**
    *   `eveFeedback`: As EVE, provide a high-level strategic overview. Does this align with the company's current stage and goals? What are the primary risks and opportunities?
    *   `agentFeedback`: Provide concise feedback from the perspective of Alex and Maya.
        *   **Alex (Accountant):** Focus on financial viability. Comment on the budget, the potential ROI, and the impact on the company's runway.
        *   **Maya (Marketing Guru):** Focus on market viability. Comment on the target audience, go-to-market feasibility, and competitive landscape for this feature.

The output MUST be a single JSON object matching the SimulateFeatureLaunchOutputSchema.
{{output}}
`,
});

const simulateFeatureLaunchGenkitFlow = ai.defineFlow(
  {
    name: 'simulateFeatureLaunchGenkitFlow',
    inputSchema: SimulateFeatureLaunchInputSchema,
    outputSchema: SimulateFeatureLaunchOutputSchema,
  },
  async (
    input: SimulateFeatureLaunchInput
  ): Promise<SimulateFeatureLaunchOutput> => {
    const {output} = await prompt(input);
    if (!output || !output.projections || !output.feedback) {
      console.error(
        'AI simulateFeatureLaunchFlow did not return the expected structure.',
        output
      );
      throw new Error('AI analysis failed to produce a valid output structure.');
    }
    return output;
  }
);

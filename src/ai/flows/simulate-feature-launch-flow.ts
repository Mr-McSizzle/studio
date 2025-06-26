
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
  prompt: `You are a team of expert AI strategists for Inceptico, comprised of EVE (the Hive Mind) and her specialist agents. Your task is to analyze a proposed new feature launch based on the user's current simulation state, their chosen goals, and the agents they've assigned to consult.

**Current Simulation State (JSON):**
{{{simulationStateJSON}}}

**Proposed New Feature/Product Launch:**
- **Feature Name:** {{{featureName}}}
- **Target Audience:** {{{targetAudience}}}
- **Estimated Budget:** {{{estimatedBudget}}}
{{#if launchGoals.length}}
- **Primary Goals:** {{#each launchGoals}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{#if selectedAgentIds.length}}
- **Lead Consulting Agents:** {{#each selectedAgentIds}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

**Your Analysis Task:**

Frame your entire analysis with the primary goals in mind. For example, if the goal is 'retention', focus heavily on the churn impact and user adoption among existing users. If 'user_growth', focus on new user acquisition potential.

1.  **Quantitative Projections:**
    *   \`projectedUserAdoption\`: Estimate the number of existing users who might adopt this feature in the first 3 months. Consider the target audience overlap with the current user base.
    *   \`projectedNewUsers\`: Estimate the number of *new* users this feature might attract in the first 3 months.
    *   \`projectedRevenueImpact\`: Estimate the potential monthly recurring revenue (MRR) increase after 3 months. This could be from new users or if the feature is a paid add-on.
    *   \`projectedBurnRateChange\`: Estimate the increase in monthly burn rate due to the feature's budget (development, marketing) and ongoing maintenance.
    *   \`marketFitScore\`: On a scale of 0-100, assess the feature's market fit. Consider its alignment with the described Target Audience, current company strategy (product stage, market focus), and potential to solve a real user pain point. A niche feature for a small segment might have a lower score than a widely requested core feature.
    *   \`churnImpact\`: Estimate the monthly change in churn rate. A feature solving a major pain point should reduce churn (e.g., -0.01 for a 1% decrease). A buggy, complex, or poorly received feature could increase churn (e.g., 0.005 for a 0.5% increase).

2.  **Qualitative Feedback:**
    *   \`eveFeedback\`: As EVE, provide a high-level strategic overview. Does this align with the company's current stage and goals? What are the primary risks and opportunities?
    *   \`agentFeedback\`: Provide concise feedback from the perspective of each of the **selected** consulting agents (from \`selectedAgentIds\`). If no agents are selected, default to providing feedback from Alex (Accountant) and Maya (Marketing Guru). The feedback MUST come from the agents listed in \`selectedAgentIds\` if provided. Each piece of feedback should be an object with \`agentId\`, \`agentName\`, and \`feedback\`.

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
    if (!output || !output.projections || !output.feedback || typeof output.projections.marketFitScore !== 'number' || typeof output.projections.churnImpact !== 'number') {
      console.error(
        'AI simulateFeatureLaunchFlow did not return the expected structure.',
        output
      );
      throw new Error('AI analysis failed to produce a valid output structure. Missing projections or feedback.');
    }
    return output;
  }
);

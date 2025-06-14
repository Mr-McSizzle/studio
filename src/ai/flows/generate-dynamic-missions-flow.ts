
'use server';
/**
 * @fileOverview An AI flow to generate dynamic missions based on the current simulation state.
 * (Placeholder - detailed prompt and logic to be implemented)
 *
 * - generateDynamicMissions - Function to call the AI mission generation flow.
 * - GenerateDynamicMissionsInput - Input type for the flow.
 * - GenerateDynamicMissionsOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import { GenerateDynamicMissionsInputSchema, GenerateDynamicMissionsOutputSchema, type GenerateDynamicMissionsInput, type GenerateDynamicMissionsOutput } from '@/types/simulation';

export async function generateDynamicMissions(input: GenerateDynamicMissionsInput): Promise<GenerateDynamicMissionsOutput> {
  return generateDynamicMissionsGenkitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDynamicMissionsPrompt',
  input: { schema: GenerateDynamicMissionsInputSchema },
  output: { schema: GenerateDynamicMissionsOutputSchema },
  config: {
    temperature: 0.7,
  },
  prompt: `You are a game designer for ForgeSim, a business simulation platform.
Your task is to analyze the current state of the user's simulated business and generate 2-3 relevant, challenging, and rewarding missions.

Current Simulation State (JSON):
{{{simulationStateJSON}}}

{{#if recentEvents}}
Recent Significant Events:
{{#each recentEvents}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if currentGoals}}
User's Current Stated Goals:
{{#each currentGoals}}
- {{{this}}}
{{/each}}
{{/if}}

Based on this information, generate a list of 2-3 distinct missions. Each mission should have:
1.  **title**: A concise, engaging title for the mission.
2.  **description**: A clear explanation of what the user needs to achieve.
3.  **rewardText**: A textual description of the reward (e.g., "+10 Startup Score, Unlock Marketing Tier 2").
4.  **difficulty**: (Optional) 'easy', 'medium', or 'hard'.

Consider the startup's current financial health, user base, product stage, market conditions, and recent events or stated goals when crafting these missions. They should feel like natural next steps or interesting challenges.

Example Output Structure (Missions array):
[
  { "title": "Achieve First Profitable Month", "description": "Adjust your strategy to make your monthly revenue exceed expenses for the first time.", "rewardText": "+15 Startup Score, +$10,000 Cash Injection", "difficulty": "medium" },
  { "title": "Double Active User Base", "description": "Implement marketing and product strategies to double your current active user count within the next 3 simulated months.", "rewardText": "+20 Startup Score, Unlock AI Marketing Guru Pro Tips", "difficulty": "hard" }
]

The output MUST be a single JSON object matching the GenerateDynamicMissionsOutputSchema, containing an array named 'generatedMissions'.
{{output}}
`
});

const generateDynamicMissionsGenkitFlow = ai.defineFlow(
  {
    name: 'generateDynamicMissionsGenkitFlow',
    inputSchema: GenerateDynamicMissionsInputSchema,
    outputSchema: GenerateDynamicMissionsOutputSchema,
  },
  async (input: GenerateDynamicMissionsInput): Promise<GenerateDynamicMissionsOutput> => {
    const {output} = await prompt(input);

    if (!output || !Array.isArray(output.generatedMissions)) {
      console.error("AI generateDynamicMissionsFlow did not return the expected 'generatedMissions' array.", output);
      // Provide a fallback or throw a more specific error
      return { generatedMissions: [{title: "Error Generating Mission", description: "AI failed to generate missions.", rewardText: "N/A"}] };
    }
    return output;
  }
);

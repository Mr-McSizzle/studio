
'use server';
/**
 * @fileOverview An AI flow to generate dynamic missions based on the current simulation state.
 *
 * - generateDynamicMissions - Function to call the AI mission generation flow.
 * - GenerateDynamicMissionsInput - Input type for the flow.
 * - GenerateDynamicMissionsOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import { GenerateDynamicMissionsInputSchema, GenerateDynamicMissionsOutputSchema, type GenerateDynamicMissionsInput, type GenerateDynamicMissionsOutput, MissionSchema } from '@/types/simulation';

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
  prompt: `You are an expert game designer and startup advisor for ForgeSim, a business simulation platform.
Your task is to analyze the current state of the user's simulated business and generate 2-3 relevant, challenging, and rewarding missions.

Current Simulation State (JSON):
{{{simulationStateJSON}}}

{{#if recentEvents}}
Recent Significant Events (last 1-2 months):
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

Based on ALL available information, generate a list of 2-3 distinct missions. Each mission should have:
1.  **title**: A concise, engaging title for the mission (e.g., "Stabilize Cash Flow", "Achieve Product-Market Fit MVP", "Double Monthly Active Users").
2.  **description**: A clear explanation of what the user needs to achieve or what conditions signify success. This should be actionable.
3.  **rewardText**: A textual description of the reward upon completion (e.g., "+10 Startup Score, +$5,000 Seed Funding", "+15 Startup Score, Unlock Advanced Marketing Tactics", "+5 Startup Score, Team Morale Boost"). Keep rewards impactful but balanced for a simulation.
4.  **difficulty**: (Optional) Assign a difficulty: 'easy', 'medium', or 'hard'.

Consider the startup's current financial health (cash, burn rate, revenue), user base (active users, growth, churn), product stage (idea, prototype, mvp, growth), market conditions, recent key events, stated goals, and overall startup score when crafting these missions.
- If cash is low, suggest missions to improve financials or secure funding.
- If user growth is stagnant, suggest missions related to marketing or product improvement.
- If the product is early stage, missions should focus on validation and reaching MVP.
- If recent events were negative, missions could address overcoming those setbacks.
- If the Startup Score is low, missions should offer good score rewards.

Missions should feel like natural next steps or interesting challenges that guide the user towards sustainable growth or overcoming current obstacles.
Avoid generic missions. Make them specific to the context provided in the simulation state.

Example Output Structure for the 'generatedMissions' array:
[
  { "title": "Achieve First Profitable Month", "description": "Adjust your strategy (pricing, expenses, user acquisition) to make your monthly revenue exceed total monthly expenses for the first time.", "rewardText": "+15 Startup Score, +$10,000 Cash Injection", "difficulty": "medium" },
  { "title": "Double Active User Base in 3 Months", "description": "Implement marketing and product strategies to double your current active user count within the next 3 simulated months from its current value of {{simulationState.userMetrics.activeUsers}}.", "rewardText": "+20 Startup Score, Unlock AI Marketing Guru Pro Tips", "difficulty": "hard" },
  { "title": "Reduce Churn Rate by 20%", "description": "Identify causes of user churn and implement changes to reduce your monthly churn rate by at least 20% from its current {{simulationState.userMetrics.churnRate}}.", "rewardText": "+10 Startup Score, Customer Loyalty Boost (Conceptual)", "difficulty": "medium" }
]

The output MUST be a single JSON object matching the GenerateDynamicMissionsOutputSchema, containing an array named 'generatedMissions'. Each object in the array must conform to the fields: title (string), description (string), rewardText (string), and optionally difficulty (enum: 'easy', 'medium', 'hard').
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
      return { generatedMissions: [{title: "Mission Generation Error", description: "The AI failed to generate missions. Please try again.", rewardText: "N/A"}] };
    }
    // Validate each mission object
    for (const mission of output.generatedMissions) {
      if (!mission.title || !mission.description || !mission.rewardText) {
        console.warn("AI generated a malformed mission object:", mission);
        // Optionally, you could filter out malformed missions or replace them
      }
    }
    return output;
  }
);


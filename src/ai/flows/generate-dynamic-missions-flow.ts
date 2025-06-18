
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
    temperature: 0.75, // Slightly higher for more creative/varied missions
  },
  prompt: `You are an expert game designer and startup advisor for ForgeSim, a business simulation platform.
Your task is to analyze the current state of the user's simulated business and generate 2-3 relevant, challenging, and rewarding missions.

Current Simulation State (JSON):
{{{simulationStateJSON}}}

{{#if recentEvents}}
Recent Significant Events (last 1-2 months, these are descriptions of StructuredKeyEvents):
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
1.  **title**: A concise, engaging title for the mission (e.g., "Stabilize Cash Flow", "Achieve Product-Market Fit MVP", "Double Monthly Active Users", "Navigate Competitor Price War").
2.  **description**: A clear explanation of what the user needs to achieve or what conditions signify success. This should be actionable and specific.
3.  **rewardText**: A textual description of the reward upon completion (e.g., "+10 Startup Score, +$5,000 Seed Funding", "+15 Startup Score, Unlock Advanced Marketing Tactics from Maya", "+5 Startup Score, Team Morale Boost"). Keep rewards impactful but balanced for a simulation.
4.  **difficulty**: (Optional) Assign a difficulty: 'easy', 'medium', or 'hard'.

**Mission Generation Guidelines:**
- **Contextual Relevance:** Missions should feel like natural next steps or interesting challenges that guide the user towards sustainable growth or overcoming current obstacles.
- **Variety:** Aim for a mix of mission types. Consider:
    - **Growth-oriented:** Achieving specific user, revenue, or market share milestones.
    - **Problem-solving:** Addressing negative trends or recent setbacks identified in 'recentEvents' or the simulation state (e.g., high churn, low cash, negative PR).
    - **Opportunity-driven:** Capitalizing on recent positive events or favorable market conditions.
    - **Exploration/Learning:** Encouraging use of specific game features or consultation with AI agents (e.g., "Run a 'What-If' scenario in the Innovation Lab for your biggest risk," "Consult Zara for feedback on your new product feature").
- **Specificity:** Avoid generic missions. Make them specific to the context provided in the simulation state and recent events.
    - If cash is low (check 'financials.cashOnHand' vs 'financials.burnRate'), suggest missions to improve financials or secure funding.
    - If user growth is stagnant (check 'userMetrics.activeUsers' and 'userMetrics.newUserAcquisitionRate'), suggest missions related to marketing or product improvement.
    - If the product is early stage ('product.stage' is 'idea' or 'prototype'), missions should focus on validation and reaching MVP.
    - If 'recentEvents' indicate a competitor action, a mission could be "Develop a counter-strategy to Competitor X's new pricing model."
    - If 'recentEvents' indicate a product issue, a mission could be "Address the user feedback on Feature Y and reduce related churn."
    - If the Startup Score is low, missions should offer good score rewards.

Example Output Structure for the 'generatedMissions' array:
[
  { "title": "Achieve First Profitable Month", "description": "Adjust your strategy (pricing, expenses, user acquisition) to make your monthly revenue exceed total monthly expenses for the first time.", "rewardText": "+15 Startup Score, +$10,000 Cash Injection", "difficulty": "medium" },
  { "title": "Counter Competitor Z's Marketing Blitz", "description": "Analyze Competitor Z's recent aggressive marketing (mentioned in events) and launch a targeted counter-campaign or product enhancement to retain market share within the next 2 months. Consult Maya for ideas.", "rewardText": "+10 Startup Score, 'Strategic Thinker' Badge", "difficulty": "hard" },
  { "title": "Resolve Feature Glitch X", "description": "Based on recent user feedback (simulated or from events), prioritize R&D to fix the critical glitch in Feature X within one month to improve user satisfaction and reduce churn.", "rewardText": "+8 Startup Score, User Loyalty Boost", "difficulty": "medium" }
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



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
  prompt: `You are an expert game designer and startup advisor for Inceptico, a business simulation platform.
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
    - **Problem-solving:** Addressing negative trends like high churn. This includes missions to **analyze churn feedback**, perhaps by consulting Zara (e.g., 'Task Zara with a focus group to understand why users are leaving').
    - **Opportunity-driven:** Capitalizing on recent positive events or market conditions. This could involve missions to **launch a new marketing campaign** with Maya if growth is stagnant but finances are stable.
    - **Exploration/Learning:** Encouraging use of specific game features or consultation with AI agents (e.g., "Run a 'What-If' scenario in the Innovation Lab").
    - **Product Development:** For products in 'growth' or 'mature' stages, suggest missions to **implement a new strategic feature** to stay competitive.
- **Specificity:** Avoid generic missions. Make them specific to the context provided in the simulation state and recent events.
    - If cash is low (check 'financials.cashOnHand' vs 'financials.burnRate'), suggest missions to improve financials or secure funding.
    - If user growth is stagnant (check 'userMetrics.activeUsers' and 'userMetrics.newUserAcquisitionRate'), suggest missions related to marketing or product improvement.
    - If the product is early stage ('product.stage' is 'idea' or 'prototype'), missions should focus on validation and reaching MVP.
    - If 'recentEvents' indicate a competitor action, a mission could be "Develop a counter-strategy to Competitor X's new pricing model."
    - If 'recentEvents' indicate a product issue or high churn, a mission could be "Address the user feedback on Feature Y and reduce related churn by consulting with Zara."
    - If the Startup Score is low, missions should offer good score rewards.

Example Output Structure for the 'generatedMissions' array:
[
  { "title": "Launch 'Enterprise Analytics' Feature", "description": "Your product is mature enough for a new major feature. Allocate R&D resources to implement the 'Enterprise Analytics' suite to attract higher-value customers.", "rewardText": "+15 Startup Score, Unlocks Enterprise Sales Strategies", "difficulty": "hard" },
  { "title": "Analyze and Combat Churn", "description": "Your churn rate is climbing. Consult with Zara to run a simulated focus group, identify the root causes of user churn, and propose a solution.", "rewardText": "+10 Startup Score, 'Customer-Centric' Badge", "difficulty": "medium" },
  { "title": "Execute 'Summer Growth' Marketing Campaign", "description": "User acquisition has slowed. Work with Maya to design and launch a new marketing campaign with a budget of $10,000 to re-ignite user growth.", "rewardText": "+8 Startup Score, Potential for +500 new users", "difficulty": "medium" }
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

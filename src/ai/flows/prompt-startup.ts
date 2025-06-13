
// src/ai/flows/prompt-startup.ts
'use server';
/**
 * @fileOverview A flow to initialize the startup simulation (digital twin)
 * based on a user-provided business plan, target market, budget, currency, and specific goals.
 *
 * - promptStartup - A function that takes user input and returns initial startup conditions for the simulation.
 * - PromptStartupInput - The input type for the promptStartup function.
 * - PromptStartupOutput - The return type for the promptStartup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PromptStartupInputSchema = z.object({
  prompt: z
    .string()
    .describe('A detailed description of the desired startup, including its business plan/idea, target market, and initial budget. This will also include the preferred currency code and any specific goals.'),
  currencyCode: z.string().optional().describe('The 3-letter currency code (e.g., USD, EUR, JPY) the user wants the simulation to be in. All monetary values in the output should be relative to this currency.'),
  targetGrowthRate: z.string().optional().describe('User\'s target monthly user growth rate (e.g., "20" for 20%).'),
  desiredProfitMargin: z.string().optional().describe('User\'s desired profit margin (e.g., "15" for 15%).'),
  targetCAC: z.string().optional().describe('User\'s target Customer Acquisition Cost (e.g., "25" if currency is USD).'),
});
export type PromptStartupInput = z.infer<typeof PromptStartupInputSchema>;

const PromptStartupOutputSchema = z.object({
  initialConditions: z
    .string()
    .describe('A JSON string representing the initial conditions of the startup\'s digital twin, including market parameters, resources, initial team setup, and key financial metrics. All monetary values must be in the specified currency.'),
  suggestedChallenges: z
    .string()
    .describe('A list of potential strategic challenges or critical decisions the startup might face early in the simulation, formatted as a JSON array of strings. These should consider any specific goals provided by the user.'),
});
export type PromptStartupOutput = z.infer<typeof PromptStartupOutputSchema>;

export async function promptStartup(input: PromptStartupInput): Promise<PromptStartupOutput> {
  return promptStartupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'promptStartupPrompt',
  input: {schema: PromptStartupInputSchema},
  output: {schema: PromptStartupOutputSchema},
  prompt: `You are an expert startup simulator and business strategist. Your task is to take a user's description of their desired startup (including their business plan/idea, target market, initial budget, preferred currency code: {{{currencyCode}}}, and any specified goals) and generate the initial conditions for a "digital twin" simulation. Also, suggest a list of potential early-stage challenges or key decisions, considering their goals.

User Startup Description:
{{{prompt}}}
(This includes: Business Plan, Target Market, Budget, Preferred Currency: {{{currencyCode}}}
{{#if targetGrowthRate}}Target Monthly User Growth Rate: {{{targetGrowthRate}}}%{{/if}}
{{#if desiredProfitMargin}}Desired Profit Margin: {{{desiredProfitMargin}}}%{{/if}}
{{#if targetCAC}}Target Customer Acquisition Cost (CAC): {{{currencyCode}}} {{{targetCAC}}}{{/if}}
)

Based on this comprehensive description, generate:
1. Initial Conditions: A detailed JSON string for the startup's digital twin. This should include realistic starting values for:
    - Market: Estimated size, growth rate, key segments.
    - Resources:
        - initialFunding: CRITICALLY IMPORTANT - Set this to the numerical value of the user's provided 'Initial Budget'. Ensure this is a clean number.
        - coreTeam: (e.g., number of founders, initial hires if any, AI-suggested salaries).
        - any initial IP or assets.
        - marketingSpend: Suggest a realistic initial monthly marketing spend. If the user provided a target CAC, this might be adjusted.
        - rndSpend: Suggest a realistic initial monthly R&D spend.
    - Product/Service:
        - name: A suitable name for the product/service.
        - initialDevelopmentStage: (e.g., idea, prototype, mvp). This should map to 'idea', 'prototype', 'mvp', 'growth', or 'mature'.
        - pricePerUser: Suggest an initial monthly price per user/customer. This might be influenced by profit margin goals if provided.
    - Financials:
        - startingCash: CRITICALLY IMPORTANT - Set this to the numerical value of the user's provided 'Initial Budget'. Ensure this is a clean number.
        - estimatedInitialMonthlyBurnRate: CRITICALLY IMPORTANT - Provide a realistic estimate of the *total* initial monthly burn rate.
        - currencyCode: Set this to {{{currencyCode}}}.
    - initialGoals: One or two key short-term objectives. If the user provided specific goals (growth, profit, CAC), incorporate them or related stepping stones here.
    - companyName: A suitable name for the startup itself.
2. Suggested Challenges: A JSON array of 3-5 strings outlining potential strategic challenges. These should be specific and actionable. If the user set ambitious goals (e.g., high growth with low CAC), challenges should reflect the difficulty of achieving these (e.g., "Balancing rapid user acquisition (target: {{{targetGrowthRate}}}%) with maintaining a CAC below {{{currencyCode}}} {{{targetCAC}}} will require exceptional marketing efficiency.").

CRITICAL INSTRUCTIONS FOR JSON VALIDITY AND CONTENT:
- The 'initialConditions' field MUST be a single, valid, strictly parsable JSON string. NO EXCEPTIONS.
- Ensure NO trailing commas in JSON objects or arrays.
- Ensure all strings within the JSON are properly quoted and special characters escaped.
- All monetary values MUST be plain numbers in the specified {{{currencyCode}}}.
- You MUST adjust the *scale* of numbers to be realistic for that currency and budget.
- Ensure 'financials.currencyCode', 'financials.startingCash', 'resources.initialFunding', and 'financials.estimatedInitialMonthlyBurnRate' are clean numerical values.
- The 'suggestedChallenges' field MUST be a valid JSON array of strings.
- Do not include any prose outside the structured JSON output. The entire response MUST BE ONLY the JSON object defined by the output schema.

{{output}}
`,
});

const promptStartupFlow = ai.defineFlow(
  {
    name: 'promptStartupFlow',
    inputSchema: PromptStartupInputSchema,
    outputSchema: PromptStartupOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.initialConditions || !output.suggestedChallenges) {
      console.error("AI promptStartup did not return the expected structure.", output);
      throw new Error("Failed to get complete initial conditions from AI. The response was malformed.");
    }
    // Basic validation of critical numeric fields can be helpful for debugging AI consistency
    try {
        const conditions = JSON.parse(output.initialConditions);
        if (!conditions.financials || !conditions.financials.currencyCode) {
            console.warn("AI did not explicitly include financials.currencyCode in initialConditions.");
        } else if (input.currencyCode && conditions.financials.currencyCode.toUpperCase() !== input.currencyCode.toUpperCase()) {
            console.warn(`AI returned currencyCode ${conditions.financials.currencyCode} which differs from input ${input.currencyCode}.`);
        }
        if (conditions.financials && typeof conditions.financials.startingCash !== 'number') {
            console.warn(`AI returned financials.startingCash that is not a number: `, conditions.financials.startingCash);
        }
         if (conditions.resources && typeof conditions.resources.initialFunding !== 'number') {
            console.warn(`AI returned resources.initialFunding that is not a number: `, conditions.resources.initialFunding);
        }
        if (conditions.financials && typeof conditions.financials.estimatedInitialMonthlyBurnRate !== 'number') {
            console.warn(`AI returned financials.estimatedInitialMonthlyBurnRate that is not a number: `, conditions.financials.estimatedInitialMonthlyBurnRate);
        }
    } catch (e) {
        // This catch is for the debugging validation above, not the main parse in the store.
        // The main parse error is handled in simulationStore.ts.
        console.error("Could not parse initialConditions during AI flow for validation. This is not the main parsing error but indicates a problem with AI's JSON output.", e);
    }
    return output;
  }
);

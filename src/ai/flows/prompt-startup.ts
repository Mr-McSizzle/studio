
// src/ai/flows/prompt-startup.ts
'use server';
/**
 * @fileOverview A flow to initialize the startup simulation (digital twin) 
 * based on a user-provided business plan, target market, budget, and currency.
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
    .describe('A detailed description of the desired startup, including its business plan/idea, target market, and initial budget. This will also include the preferred currency code.'),
  currencyCode: z.string().optional().describe('The 3-letter currency code (e.g., USD, EUR, JPY) the user wants the simulation to be in. All monetary values in the output should be relative to this currency.'),
});
export type PromptStartupInput = z.infer<typeof PromptStartupInputSchema>;

const PromptStartupOutputSchema = z.object({
  initialConditions: z
    .string()
    .describe('A JSON string representing the initial conditions of the startup\'s digital twin, including market parameters, resources, initial team setup, and key financial metrics. All monetary values must be in the specified currency.'),
  suggestedChallenges: z
    .string()
    .describe('A list of potential strategic challenges or critical decisions the startup might face early in the simulation, formatted as a JSON array of strings.'),
});
export type PromptStartupOutput = z.infer<typeof PromptStartupOutputSchema>;

export async function promptStartup(input: PromptStartupInput): Promise<PromptStartupOutput> {
  return promptStartupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'promptStartupPrompt',
  input: {schema: PromptStartupInputSchema},
  output: {schema: PromptStartupOutputSchema},
  prompt: `You are an expert startup simulator and business strategist. Your task is to take a user's description of their desired startup (including their business plan/idea, target market, initial budget, and preferred currency code: {{{currencyCode}}}) and generate the initial conditions for a "digital twin" simulation. Also, suggest a list of potential early-stage challenges or key decisions.

User Startup Description (Business Plan, Target Market, Budget, Preferred Currency: {{{currencyCode}}}):
{{{prompt}}}

Based on this comprehensive description, generate:
1. Initial Conditions: A detailed JSON string for the startup's digital twin. This should include realistic starting values for:
    - Market: Estimated size, growth rate, key segments.
    - Resources: Initial funding (based on budget), core team (e.g., number of founders, initial hires if any), any initial IP or assets.
    - Product/Service: Initial development stage (e.g., concept, prototype, MVP).
    - Financials: Starting cash, estimated initial monthly burn rate. Include a 'currencyCode' field set to {{{currencyCode}}}.
    - Initial Goals: One or two key short-term objectives (e.g., achieve X users, secure Y pre-orders).
2. Suggested Challenges: A JSON array of 3-5 strings outlining potential strategic challenges or critical decisions the startup might face early in the simulation. These should be specific and actionable.

CRITICAL INSTRUCTIONS:
- All monetary values you generate (initial funding, starting cash, burn rate, market size if applicable, salaries if defined) MUST be expressed in the specified {{{currencyCode}}}.
- You MUST also adjust the *scale* of these numbers and market parameters to be realistic for a business operating with that currency and the provided budget magnitude. For example, a 'small tech startup' budget of 50,000 JPY is vastly different from 50,000 USD, and market sizes would also differ. Make the simulation parameters feel appropriate for the chosen currency context.
- Ensure the 'initialConditions' field is a single, valid, parsable JSON string, and it includes a 'financials.currencyCode': '{{{currencyCode}}}' entry.
- Ensure the 'suggestedChallenges' field is a valid JSON array of strings.
Do not include any prose or explanations outside of the structured JSON output. The entire response should be only the JSON object defined by the output schema.

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
    // Validate if AI included currencyCode in financials (optional, good for debugging)
    try {
        const conditions = JSON.parse(output.initialConditions);
        if (!conditions.financials || !conditions.financials.currencyCode) {
            console.warn("AI did not explicitly include financials.currencyCode in initialConditions. This is expected if not prompted or if the model omits it.");
        } else if (conditions.financials.currencyCode.toUpperCase() !== input.currencyCode?.toUpperCase()) {
            console.warn(`AI returned currencyCode ${conditions.financials.currencyCode} which differs from input ${input.currencyCode}.`);
        }
    } catch (e) {
        console.error("Could not parse initialConditions to check for currencyCode.", e);
    }
    return output;
  }
);

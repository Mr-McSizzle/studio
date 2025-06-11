// src/ai/flows/prompt-startup.ts
'use server';
/**
 * @fileOverview A flow to initialize the startup simulation based on a user-provided prompt.
 *
 * - promptStartup - A function that takes a user prompt and returns initial startup conditions.
 * - PromptStartupInput - The input type for the promptStartup function.
 * - PromptStartupOutput - The return type for the promptStartup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PromptStartupInputSchema = z.object({
  prompt: z
    .string()
    .describe('A detailed description of the desired startup and its initial conditions.'),
});
export type PromptStartupInput = z.infer<typeof PromptStartupInputSchema>;

const PromptStartupOutputSchema = z.object({
  initialConditions: z
    .string()
    .describe('A JSON string representing the initial conditions of the startup, including market, resources, and challenges.'),
  suggestedChallenges: z
    .string()
    .describe('A list of potential challenges the startup might face, formatted as a JSON array of strings.'),
});
export type PromptStartupOutput = z.infer<typeof PromptStartupOutputSchema>;

export async function promptStartup(input: PromptStartupInput): Promise<PromptStartupOutput> {
  return promptStartupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'promptStartupPrompt',
  input: {schema: PromptStartupInputSchema},
  output: {schema: PromptStartupOutputSchema},
  prompt: `You are a startup simulation expert. You will take a user's description of their desired startup and generate initial conditions and challenges for the simulation.

User Startup Description: {{{prompt}}}

Based on this description, generate initial conditions (as a JSON string) and suggest a list of potential challenges (as a JSON array of strings).

Ensure the initial conditions include realistic starting values for key metrics like market size, available resources, and initial customer base.

Return the initial conditions as a parsable JSON string and challenges as a JSON array of strings. Do not include any prose in your response, only the JSON. Note that the initialConditions MUST be valid JSON.

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
    return output!;
  }
);

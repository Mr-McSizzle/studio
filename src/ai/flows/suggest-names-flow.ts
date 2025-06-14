
'use server';
/**
 * @fileOverview An AI flow to suggest company and product names based on a business idea.
 *
 * - suggestNames - Function to call the AI name suggestion flow.
 * - SuggestNamesInput - Input type for the flow.
 * - SuggestNamesOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import { SuggestNamesInputSchema, SuggestNamesOutputSchema, type SuggestNamesInput, type SuggestNamesOutput } from '@/types/simulation';

export async function suggestNames(input: SuggestNamesInput): Promise<SuggestNamesOutput> {
  return suggestNamesGenkitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNamesPrompt',
  input: { schema: SuggestNamesInputSchema },
  output: { schema: SuggestNamesOutputSchema },
  config: {
    temperature: 0.8, // Higher temperature for more creative suggestions
  },
  prompt: `You are a creative branding expert specializing in naming businesses and products.
A user needs help generating name ideas.

Business Idea / Core Concept:
"{{{businessIdea}}}"

Optional Keywords Provided by User:
{{#if keywords.length}}
{{#each keywords}}
- {{{this}}}
{{/each}}
{{else}}
No specific keywords provided.
{{/if}}

Based on the business idea and any keywords, please generate:
1.  **Suggested Company Names**: A list of 3-5 creative, relevant, and memorable company names.
2.  **Suggested Product Names**: A list of 3-5 creative, relevant, and appealing product/service names directly related to the business idea.

Ensure the names are diverse in style (some modern, some classic, some descriptive, some abstract if appropriate).
The output MUST be a single JSON object matching the SuggestNamesOutputSchema.
{{output}}
`
});

const suggestNamesGenkitFlow = ai.defineFlow(
  {
    name: 'suggestNamesGenkitFlow',
    inputSchema: SuggestNamesInputSchema,
    outputSchema: SuggestNamesOutputSchema,
  },
  async (input: SuggestNamesInput): Promise<SuggestNamesOutput> => {
    const {output} = await prompt(input);

    if (!output || !Array.isArray(output.suggestedCompanyNames) || !Array.isArray(output.suggestedProductNames)) {
      console.error("AI suggestNamesFlow did not return the expected arrays for names.", output);
      return { 
        suggestedCompanyNames: ["Error: AI failed to generate company names."], 
        suggestedProductNames: ["Error: AI failed to generate product names."]
      };
    }
    return output;
  }
);

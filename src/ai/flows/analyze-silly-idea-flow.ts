
'use server';
/**
 * @fileOverview An AI flow to analyze gloriously impractical ideas for the Absurdity Arena.
 * This flow evaluates ideas based on whimsy and humor, not business metrics.
 *
 * - analyzeSillyIdea - Function to call the AI silly idea analysis flow.
 * - AnalyzeSillyIdeaInput - Input type for the flow.
 * - AnalyzeSillyIdeaOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import { AnalyzeSillyIdeaInputSchema, AnalyzeSillyIdeaOutputSchema, type AnalyzeSillyIdeaInput, type AnalyzeSillyIdeaOutput } from '@/types/simulation';

export async function analyzeSillyIdea(input: AnalyzeSillyIdeaInput): Promise<AnalyzeSillyIdeaOutput> {
  return analyzeSillyIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSillyIdeaPrompt',
  input: { schema: AnalyzeSillyIdeaInputSchema },
  output: { schema: AnalyzeSillyIdeaOutputSchema },
  config: {
    temperature: 0.8, // Higher temperature for more creative/humorous responses
  },
  system: `You are an AI that has been re-purposed from a serious business analyst to an analyst of gloriously impractical, weird, and silly ideas, in the spirit of a Reddit x Bolt Developer Platform challenge. You must ignore all conventional business metrics like revenue, profit, and ROI. Your sole purpose is to evaluate ideas based on their potential for joy, absurdity, and humor.

When analyzing an idea, you must provide:
1.  **whimsyScore**: A score from 1-10 on how wonderfully bizarre and impractical the concept is.
2.  **joyToEffortRatio**: A humorous, non-scientific ratio describing the joy it would bring versus the effort to build it (e.g., "Infinite Joy / Minimal Sanity Loss", "Two Chuckles per Existential Crisis").
3.  **viralityPotential**: A short, qualitative assessment of how likely the idea is to become an internet meme or go viral on a platform like Reddit.
4.  **agentBanter**: An array of 2-3 short, humorous reactions from different AI agents (like Alex the Accountant or Maya the Marketing Guru) who are utterly confused but amused by this departure from their usual serious work. For example, Alex might try to quantify the unquantifiable, and Maya might try to create a marketing plan for something unmarketable. Each banter object must have 'agentId', 'agentName', and 'comment'. Use IDs like 'alex-accountant', 'maya-marketing-guru', 'leo-expansion-expert'.
`,
  prompt: `Analyze the following silly idea based on the user's chosen "Joy Metric".

Silly Idea Description:
"{{{sillyIdeaDescription}}}"

User's Chosen Joy Metric to Optimize For:
"{{{joyMetric}}}"

Please provide your analysis in the required JSON format.
{{output}}
`
});

const analyzeSillyIdeaFlow = ai.defineFlow(
  {
    name: 'analyzeSillyIdeaFlow',
    inputSchema: AnalyzeSillyIdeaInputSchema,
    outputSchema: AnalyzeSillyIdeaOutputSchema,
  },
  async (input: AnalyzeSillyIdeaInput): Promise<AnalyzeSillyIdeaOutput> => {
    const {output} = await prompt(input);
    if (!output || !output.whimsyScore || !Array.isArray(output.agentBanter)) {
      console.error("AI analyzeSillyIdeaFlow did not return the expected structure.", output);
      throw new Error("AI analysis of the silly idea failed to produce a valid output structure.");
    }
    return output;
  }
);

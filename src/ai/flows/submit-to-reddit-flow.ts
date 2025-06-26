
'use server';
/**
 * @fileOverview A flow to handle submitting a silly idea to Reddit.
 * This flow formats the content and calls a placeholder Reddit tool.
 *
 * - submitToReddit - Function to call the Reddit submission flow.
 * - SubmitToRedditInput - Input type for the flow.
 * - SubmitToRedditOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { redditTool } from '@/ai/tools/reddit-tool';
import { SubmitToRedditInputSchema, SubmitToRedditOutputSchema, type SubmitToRedditInput, type SubmitToRedditOutput } from '@/types/simulation';

export async function submitToReddit(input: SubmitToRedditInput): Promise<SubmitToRedditOutput> {
  return submitToRedditFlow(input);
}

const submitToRedditFlow = ai.defineFlow(
  {
    name: 'submitToRedditFlow',
    inputSchema: SubmitToRedditInputSchema,
    outputSchema: SubmitToRedditOutputSchema,
  },
  async (input) => {
    // Format the title and body for the Reddit post
    const postTitle = `[Absurdity Arena Idea] ${input.sillyIdeaTitle}`;
    const agentBanterText = input.agentBanter.map(b => `> **${b.agentName}:** "${b.comment}"`).join('\n\n');

    const postBody = `
**The Gloriously Impractical Idea:**
${input.sillyIdeaDescription}

---
### AI-Generated Feasibility Report:
-   **Whimsy Score:** ${input.whimsyScore}/10
-   **Virality Potential:** ${input.viralityPotential}
-   **Joy-to-Effort Ratio:** ${input.joyToEffortRatio}

---
### AI Agent Team Reactions:
${agentBanterText}

---
*This idea was generated and analyzed in the Inceptico Absurdity Arena, inspired by the Reddit x Bolt challenge.*
    `;
    
    // Call the placeholder tool to "post" to a fictional subreddit
    const result = await redditTool({
      subreddit: 'sillyappideas', 
      title: postTitle,
      body: postBody,
    });

    return result;
  }
);


'use server';
/**
 * @fileOverview Zara, the AI Focus Group Leader tool.
 *
 * - zaraTheFocusGroupLeaderTool - The Genkit tool definition for Zara.
 */

import {ai} from '@/ai/genkit';
import { 
  ZaraTheFocusGroupLeaderToolInputSchema, 
  type ZaraTheFocusGroupLeaderToolInput, 
  ZaraTheFocusGroupLeaderToolOutputSchema,
  type ZaraTheFocusGroupLeaderToolOutput
} from '@/types/simulation';

export const zaraTheFocusGroupLeaderTool = ai.defineTool(
  {
    name: 'zaraTheFocusGroupLeaderTool',
    description: 'Simulates customer feedback on products, features, branding, or marketing messages. Use this when the user wants to understand potential customer reactions, as if from a focus group led by Zara.',
    inputSchema: ZaraTheFocusGroupLeaderToolInputSchema,
    outputSchema: ZaraTheFocusGroupLeaderToolOutputSchema,
  },
  async (input: ZaraTheFocusGroupLeaderToolInput): Promise<ZaraTheFocusGroupLeaderToolOutput> => {
    let feedbackSummary = "Zara, your AI Focus Group Leader, has gathered simulated feedback. ";
    const { query, itemToTest, targetAudiencePersona } = input;

    feedbackSummary += `On testing '${itemToTest || 'the concept'}' with a simulated focus group representing '${targetAudiencePersona || 'your target audience'}':\n`;

    if (itemToTest.toLowerCase().includes("pricing") || query.toLowerCase().includes("price")) {
      feedbackSummary += "- *Feedback on Pricing*: Some found it reasonable given the perceived value, while others felt it was slightly premium for the current offering. Suggestions included a tiered model or an introductory discount.\n";
    } else if (itemToTest.toLowerCase().includes("logo") || itemToTest.toLowerCase().includes("brand") || query.toLowerCase().includes("branding")) {
      feedbackSummary += "- *Feedback on Branding*: The overall aesthetic was well-received, described as 'modern' and 'trustworthy'. A few participants suggested the color palette could be bolder to stand out more.\n";
    } else if (itemToTest.toLowerCase().includes("feature") || query.toLowerCase().includes("product function")) {
      feedbackSummary += "- *Feedback on Feature*: The core utility of the feature was understood and appreciated. Key concerns revolved around ease of integration with existing tools and the initial learning curve. Participants requested clearer onboarding tutorials.\n";
    } else {
      feedbackSummary += "- *General Feedback*: The concept was generally met with positive interest. Key themes that emerged were [Simulated Positive Theme 1, e.g., 'innovation'], [Simulated Positive Theme 2, e.g., 'convenience']. Areas for improvement highlighted were [Simulated Concern 1, e.g., 'user interface clarity on mobile'], and [Simulated Concern 2, e.g., 'customer support responsiveness'].\n";
    }
    
    feedbackSummary += "\nRemember, this is simulated feedback based on personas and common reactions.";
    
    return { feedbackSummary };
  }
);

    
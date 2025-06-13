
'use server';
/**
 * @fileOverview Ty, the AI Social Media Strategist tool.
 *
 * - tyTheSocialMediaStrategistTool - The Genkit tool definition for Ty.
 */

import {ai} from '@/ai/genkit';
import { 
  TyTheSocialMediaStrategistToolInputSchema, 
  type TyTheSocialMediaStrategistToolInput, 
  TyTheSocialMediaStrategistToolOutputSchema,
  type TyTheSocialMediaStrategistToolOutput
} from '@/types/simulation';

export const tyTheSocialMediaStrategistTool = ai.defineTool(
  {
    name: 'tyTheSocialMediaStrategistTool',
    description: 'Provides advice on organic and paid social media strategies, drafts mockup campaigns, and predicts virality. Use this when the user asks for Ty (the AI Social Media Strategist\'s) opinion or guidance on social media topics.',
    inputSchema: TyTheSocialMediaStrategistToolInputSchema,
    outputSchema: TyTheSocialMediaStrategistToolOutputSchema,
  },
  async (input: TyTheSocialMediaStrategistToolInput): Promise<TyTheSocialMediaStrategistToolOutput> => {
    let advice = "Ty, your AI Social Media Strategist, is on the case! ";
    const { query, productName, targetAudience, brandVoice } = input;

    if (query.toLowerCase().includes("organic strateg")) {
      advice += `For organic strategies for '${productName || 'your product'}' targeting '${targetAudience || 'your audience'}', focus on creating valuable, shareable content that resonates with their interests. Consistency and engagement are key. A ${brandVoice || 'unique'} brand voice will help you stand out. Consider a content calendar with themes like 'Behind-the-Scenes Tuesdays', 'User-Generated Fridays', and 'Educational Mondays'.`;
    } else if (query.toLowerCase().includes("paid social") || query.toLowerCase().includes("ads")) {
      advice += `For paid social ads for '${targetAudience || 'your audience'}', start with small, targeted campaigns to test messaging and creative. Platforms like Facebook/Instagram and LinkedIn offer robust targeting. Track your ROAS (Return on Ad Spend) closely. For '${productName || 'your product'}', an initial test budget of $500-$1000 on a key platform could provide initial data.`;
    } else if (query.toLowerCase().includes("mockup campaign") || query.toLowerCase().includes("draft campaign")) {
      advice += `Okay, let's sketch a mockup campaign for '${productName || 'your product'}'.
Theme: 'Empowering ${targetAudience || 'Users'} with ${productName || 'Our Solution'}'
Key Message: 'Experience [Key Benefit 1] and [Key Benefit 2] with the simplicity of ${productName || 'our platform'}.'
Channels: Instagram (visuals, stories), TikTok (short-form video), possibly LinkedIn if B2B.
Content Ideas:
  - Short testimonial videos from (simulated) early users.
  - A 'Day in the Life' showcasing how '${productName || 'your product'}' solves a problem for '${targetAudience || 'your audience'}'.
  - An interactive poll or quiz related to the problem space.
  - User-generated content contest with a relevant hashtag.
Call to Action: 'Learn More & Join the Movement!' or 'Get Early Access to ${productName || 'Innovation'}!'
This is a conceptual sketch, of course! We can refine it.`;
    } else if (query.toLowerCase().includes("predict virality") || query.toLowerCase().includes("go viral")) {
      advice += `Predicting virality is challenging! For '${productName || 'your concept'}', factors like emotional appeal (humor, inspiration, surprise), timeliness, uniqueness, and ease of sharing are crucial. A campaign targeting '${targetAudience || 'your audience'}' with a ${brandVoice || 'compelling'} and authentic style has a moderate chance if it taps into a current trend, is visually engaging, and includes a clear call-to-share. High production value isn't always necessary, but relatability often is.`;
    } else {
      advice += `To make a splash on social media for '${productName || 'your startup'}', we need to deeply understand your '${targetAudience || 'target audience'}', choose the right platforms where they hang out, create genuinely engaging content that speaks their language (using your ${brandVoice || 'unique brand voice'}), and be consistently present. What specific aspect of social media are you curious about today? Organic growth, paid campaigns, influencer marketing, or something else?`;
    }
    
    return { advice };
  }
);

    

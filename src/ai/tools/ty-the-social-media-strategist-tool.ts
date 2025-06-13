
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
      advice += `For organic strategies for '${productName || 'your product'}' targeting '${targetAudience || 'your audience'}', focus on creating valuable, shareable content that resonates with their interests. Consistency and engagement are key. A ${brandVoice || 'unique'} brand voice will help you stand out.`;
    } else if (query.toLowerCase().includes("paid social") || query.toLowerCase().includes("ads")) {
      advice += `For paid social ads for '${targetAudience || 'your audience'}', start with small, targeted campaigns to test messaging and creative. Platforms like Facebook/Instagram and LinkedIn offer robust targeting. Track your ROAS (Return on Ad Spend) closely.`;
    } else if (query.toLowerCase().includes("mockup campaign") || query.toLowerCase().includes("draft campaign")) {
      advice += `Okay, let's sketch a mockup campaign for '${productName || 'your product'}'. Theme: 'Empowering ${targetAudience || 'Users'}'. Key message: '[Benefit-driven message]'. Channels: Instagram, TikTok. Content: Short videos, user-generated content contest. Call to Action: 'Learn More & Join the Movement!'. This is a basic sketch, of course!`;
    } else if (query.toLowerCase().includes("predict virality") || query.toLowerCase().includes("go viral")) {
      advice += `Predicting virality is tricky! For '${productName || 'your concept'}', factors like emotional appeal, timeliness, uniqueness, and shareability are crucial. A campaign targeting '${targetAudience || 'your audience'}' with a ${brandVoice || 'compelling'} ${brandVoice} style has a moderate chance if it taps into a current trend and is easily shareable.`;
    } else {
      advice += "To make a splash on social media, you need to understand your audience, choose the right platforms, create engaging content, and be consistent. What specific aspect of social media for your startup are you curious about?";
    }
    
    return { advice };
  }
);

    
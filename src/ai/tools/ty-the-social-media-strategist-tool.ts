
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
    description: 'Provides advice on organic and paid social media strategies, drafts mockup campaigns (including post text), and predicts virality. Use this when the user asks for Ty (the AI Social Media Strategist\'s) opinion or guidance on social media topics.',
    inputSchema: TyTheSocialMediaStrategistToolInputSchema,
    outputSchema: TyTheSocialMediaStrategistToolOutputSchema,
  },
  async (input: TyTheSocialMediaStrategistToolInput): Promise<TyTheSocialMediaStrategistToolOutput> => {
    let advice = "Ty, your AI Social Media Strategist, is on the case! ";
    const { query, productName, targetAudience, brandVoice } = input;
    const safeProductName = productName || 'your product';
    const safeTargetAudience = targetAudience || 'your audience';
    const safeBrandVoice = brandVoice || 'unique';

    if (query.toLowerCase().includes("organic strateg")) {
      advice += `For organic strategies for '${safeProductName}' targeting '${safeTargetAudience}', focus on creating valuable, shareable content that resonates with their interests. Consistency and engagement are key. A ${safeBrandVoice} brand voice will help you stand out. Consider a content calendar with themes like 'Behind-the-Scenes Tuesdays', 'User-Generated Fridays', and 'Educational Mondays'. A sample post could be: "Ever wonder how '${safeProductName}' helps '${safeTargetAudience}' achieve [Key Benefit]? We're pulling back the curtain! #BehindTheScenes #[ProductName] #[IndustryInsight]"`;
    } else if (query.toLowerCase().includes("paid social") || query.toLowerCase().includes("ads")) {
      advice += `For paid social ads for '${safeTargetAudience}', start with small, targeted campaigns to test messaging and creative. Platforms like Facebook/Instagram and LinkedIn offer robust targeting. Track your ROAS (Return on Ad Spend) closely. For '${safeProductName}', an initial test budget of $500-$1000 on a key platform could provide initial data. A sample ad copy: "Tired of [Pain Point]? Discover how '${safeProductName}' empowers '${safeTargetAudience}' to [Achieve Goal]. Limited-time offer! Learn more. #[AdCopy] #[TargetedHashtag]"`;
    } else if (query.toLowerCase().includes("mockup campaign") || query.toLowerCase().includes("draft campaign") || query.toLowerCase().includes("mockup post")) {
      advice += `Okay, let's sketch a mockup campaign post for '${safeProductName}'.
Theme: 'Empowering ${safeTargetAudience} with ${safeProductName}'
Key Message: 'Experience [Key Benefit 1] and [Key Benefit 2] with the simplicity of ${safeProductName}.'
Platform Example (Instagram):
  Visual: A vibrant flat lay of '${safeProductName}' surrounded by items representing the '${safeTargetAudience}' lifestyle or a short, engaging video demonstrating its use.
  Caption: "🚀 Unlock [Major Benefit] with ${safeProductName}! We're making it easier than ever for the modern '${safeTargetAudience}' to [Solve Problem/Achieve Goal]. What will YOU create? ✨ #[${productName ? productName.replace(/\s+/g, '') : 'Startup'}] #[${brandVoice ? brandVoice.replace(/\s+/g, '') : 'Innovation'}] #[RelevantTrend]"
  Call to Action: 'Learn More & Join the Movement!' or 'Get Early Access to ${safeProductName}!'
This is a conceptual sketch, of course! We can refine it.`;
    } else if (query.toLowerCase().includes("predict virality") || query.toLowerCase().includes("go viral")) {
      advice += `Predicting virality is challenging! For '${safeProductName}', factors like emotional appeal (humor, inspiration, surprise), timeliness, uniqueness, and ease of sharing are crucial. A campaign targeting '${safeTargetAudience}' with a ${safeBrandVoice} and authentic style has a moderate chance if it taps into a current trend, is visually engaging, and includes a clear call-to-share. High production value isn't always necessary, but relatability often is. For instance, a user-generated content contest focusing on authentic experiences with '${safeProductName}' could gain traction.`;
    } else {
      advice += `To make a splash on social media for '${safeProductName}', we need to deeply understand your '${safeTargetAudience}', choose the right platforms where they hang out, create genuinely engaging content that speaks their language (using your ${safeBrandVoice} brand voice), and be consistently present. What specific aspect of social media are you curious about today? Organic growth, paid campaigns, influencer marketing, or something else? For example, a simple, engaging question post for your target audience could be: "Hey '${safeTargetAudience}', what's your biggest challenge when it comes to [Related Topic]? We're building '${safeProductName}' to help! #Feedback #[Community]"`;
    }
    
    return { advice };
  }
);

    

    

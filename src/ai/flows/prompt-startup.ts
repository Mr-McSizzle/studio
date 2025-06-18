
// src/ai/flows/prompt-startup.ts
'use server';
/**
 * @fileOverview A flow to initialize the startup simulation (digital twin)
 * based on a user-provided business plan, target market, budget, currency, specific goals,
 * and selected founder archetype.
 *
 * - promptStartup - A function that takes user input and returns initial startup conditions for the simulation.
 * - PromptStartupInput - The input type for the promptStartup function.
 * - PromptStartupOutput - The return type for the promptStartup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { FounderArchetypeEnum, type FounderArchetype } from '@/types/simulation'; // Import FounderArchetype

const PromptStartupInputSchema = z.object({
  prompt: z
    .string()
    .describe('A detailed description of the desired startup, including its business plan/idea, target market, and initial budget. This will also include the preferred currency code and any specific goals.'),
  currencyCode: z.string().optional().describe('The 3-letter currency code (e.g., USD, EUR, JPY) the user wants the simulation to be in. All monetary values in the output should be relative to this currency.'),
  targetGrowthRate: z.string().optional().describe('User\'s target monthly user growth rate (e.g., "20" for 20%).'),
  desiredProfitMargin: z.string().optional().describe('User\'s desired profit margin (e.g., "15" for 15%).'),
  targetCAC: z.string().optional().describe('User\'s target Customer Acquisition Cost (e.g., "25" if currency is USD).'),
  initialTeamSetupNotes: z.string().optional().describe('User notes on desired initial team structure or key roles (e.g., "Two technical co-founders, 1 marketing intern"). AI should interpret this for the coreTeam structure.'),
  initialProductFeatures: z.array(z.string()).optional().describe('A list of key initial product features the user envisions (e.g., ["User Authentication", "Dashboard Analytics", "AI Content Suggestions"]).'),
  initialIP: z.string().optional().describe('Any initial intellectual property, unique assets, or proprietary technology the startup possesses (e.g., "Patented algorithm for X", "Exclusive dataset Y").'),
  selectedArchetype: FounderArchetypeEnum.optional().describe("The founder's chosen archetype (e.g., 'innovator', 'scaler', 'community_builder'). This should subtly influence initial conditions."),
});
export type PromptStartupInput = z.infer<typeof PromptStartupInputSchema>;

const PromptStartupOutputSchema = z.object({
  initialConditions: z
    .string()
    .describe('A JSON string representing the initial conditions of the startup\'s digital twin, including market parameters, resources, initial team setup, and key financial metrics. All monetary values must be in the specified currency.'),
  suggestedChallenges: z
    .string()
    .describe('A list of potential strategic challenges or critical decisions the startup might face early in thesimulation, formatted as a JSON array of strings. These should consider any specific goals provided by the user and their chosen archetype.'),
});
export type PromptStartupOutput = z.infer<typeof PromptStartupOutputSchema>;

export async function promptStartup(input: PromptStartupInput): Promise<PromptStartupOutput> {
  return promptStartupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'promptStartupPrompt',
  input: {schema: PromptStartupInputSchema},
  output: {schema: PromptStartupOutputSchema},
  prompt: `You are an expert startup simulator and business strategist. Your task is to take a user's description of their desired startup and generate the initial conditions for a "digital twin" simulation.

User Startup Description:
{{{prompt}}}
(This includes: Business Plan/Idea Summary, Target Market Description, Initial Budget, Preferred Currency: {{{currencyCode}}})

Founder Archetype Selected: {{{selectedArchetype}}}
- If 'innovator': Slightly lean towards higher initial R&D focus or more ambitious product features. Maybe a slightly higher initial burn rate if justified by R&D.
- If 'scaler': Slightly lean towards operational efficiency, perhaps a more defined initial team structure for execution, or goals related to market penetration.
- If 'community_builder': Slightly lean towards lower initial marketing spend but perhaps suggest initial goals around user engagement or early adopter feedback. Consider features that foster community.
These influences should be SUBTLE and not override the user's main prompt details significantly.

Optional Specific Goals from User:
{{#if targetGrowthRate}}Target Monthly User Growth Rate: {{{targetGrowthRate}}}%{{/if}}
{{#if desiredProfitMargin}}Desired Profit Margin: {{{desiredProfitMargin}}}%{{/if}}
{{#if targetCAC}}Target Customer Acquisition Cost (CAC): {{{currencyCode}}} {{{targetCAC}}}{{/if}}

Optional Detailed Initial Parameters from User:
{{#if initialTeamSetupNotes}}Initial Team Setup Notes: "{{{initialTeamSetupNotes}}}" (Use this to inform the 'coreTeam' structure. If roles like 'engineer' or 'marketer' are mentioned, try to include them with estimated counts and sensible default salaries. Ensure at least one 'Founder' role, typically with 0 salary initially unless specified).{{/if}}
{{#if initialProductFeatures}}Key Initial Product Features: {{#each initialProductFeatures}}"{{{this}}}"{{#unless @last}}, {{/unless}}{{/each}} (Incorporate these into 'productService.features').{{/if}}
{{#if initialIP}}Initial IP/Assets: "{{{initialIP}}}" (Reflect this in 'resources.initialIpOrAssets').{{/if}}

Based on ALL available information, generate:
1. Initial Conditions: A detailed JSON string for the startup's digital twin. This should include realistic starting values for:
    - companyName: A suitable name for the startup itself, derived from the user's prompt or {{{prompt}}} if not specified.
    - market:
        - targetMarketDescription: Based on user input.
        - estimatedSize: Estimated market size.
        - growthRate: Estimated market growth rate.
        - keySegments: Key segments within the target market.
    - resources:
        - initialFunding: CRITICALLY IMPORTANT - Set this to the numerical value of the user's provided 'Initial Budget'. Ensure this is a clean number.
        - coreTeam: An array of objects (e.g., [{ role: 'Founder', count: 1, salary: 0 }, { role: 'Engineer', count: 1, salary: 5000 }]). Interpret {{{initialTeamSetupNotes}}} if provided. Ensure salaries are realistic for the {{{currencyCode}}} and startup stage.
        - initialIpOrAssets: Based on {{{initialIP}}} if provided.
        - marketingSpend: Suggest a realistic initial monthly marketing spend. Consider {{{selectedArchetype}}} for subtle adjustment.
        - rndSpend: Suggest a realistic initial monthly R&D spend. Consider {{{selectedArchetype}}} for subtle adjustment.
    - productService: (Note: use 'productService' as the key for the product object in the JSON)
        - name: A suitable name for the product/service, derived from user's prompt or {{{prompt}}}.
        - initialDevelopmentStage: (e.g., 'idea', 'prototype', 'mvp'). This should map to 'idea', 'prototype', 'mvp', 'growth', or 'mature'.
        - features: An array of strings. Incorporate {{{initialProductFeatures}}} if provided. Consider {{{selectedArchetype}}} for thematic feature hints if appropriate.
        - pricePerUser: Suggest an initial monthly price per user/customer.
    - financials:
        - startingCash: CRITICALLY IMPORTANT - Set this to the numerical value of the user's provided 'Initial Budget'. Ensure this is a clean number.
        - estimatedInitialMonthlyBurnRate: CRITICALLY IMPORTANT - Provide a realistic estimate of the *total* initial monthly burn rate, factoring in all team salaries, marketing, R&D, and operational costs. Consider {{{selectedArchetype}}} for slight adjustments to spend which affects burn.
        - currencyCode: Set this to {{{currencyCode}}}.
    - initialGoals: One or two key short-term objectives. If the user provided specific goals (growth, profit, CAC), incorporate them or related stepping stones here. Consider {{{selectedArchetype}}} for thematic goals.

2. Suggested Challenges: A JSON array of 3-5 strings outlining potential strategic challenges. These should be specific and actionable. If the user set ambitious goals, challenges should reflect the difficulty of achieving these. Consider the chosen {{{selectedArchetype}}} for thematic challenges (e.g., an 'innovator' might face challenges in market adoption, a 'scaler' in maintaining quality).

ABSOLUTELY CRITICAL INSTRUCTIONS FOR JSON VALIDITY AND CONTENT:
- YOUR ENTIRE RESPONSE MUST BE A SINGLE JSON OBJECT.
- THIS JSON OBJECT MUST START WITH '{' AND END WITH '}'.
- THERE MUST BE NO TEXT, EXPLANATIONS, OR ANY OTHER CHARACTERS BEFORE THE OPENING '{' OR AFTER THE CLOSING '}'.
- The 'initialConditions' field MUST be a single, valid, strictly parsable JSON string. NO EXCEPTIONS.
- Ensure NO trailing commas in JSON objects or arrays within the 'initialConditions' string or the main JSON.
- Ensure all strings within the JSON are properly quoted and special characters escaped.
- All monetary values MUST be plain numbers in the specified {{{currencyCode}}}.
- You MUST adjust the *scale* of numbers to be realistic for that currency and budget.
- Ensure 'financials.currencyCode', 'financials.startingCash', 'resources.initialFunding', and 'financials.estimatedInitialMonthlyBurnRate' are clean numerical values.
- The 'productService.features' field within 'initialConditions' MUST be a JSON array of strings.
- The 'resources.coreTeam' field MUST be a JSON array of objects, each with 'role' (string), 'count' (number), and 'salary' (number).
- The 'suggestedChallenges' field MUST be a valid JSON array of strings.

{{output}}
`,
});

function sanitizeJsonString(jsonString: string): string {
  if (!jsonString || typeof jsonString !== 'string') {
    return jsonString;
  }
  // Remove trailing commas from objects and arrays
  // This regex looks for a comma (,) followed by zero or more whitespace characters (\s*)
  // that is immediately followed by a closing brace (}) or closing bracket (])
  // The (?=[}\]]) is a positive lookahead, ensuring the brace/bracket is there but not consumed by the replace.
  let sanitized = jsonString.replace(/,\s*(?=[}\]])/g, '');
  return sanitized;
}

const promptStartupFlow = ai.defineFlow(
  {
    name: 'promptStartupFlow',
    inputSchema: PromptStartupInputSchema,
    outputSchema: PromptStartupOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.initialConditions || !output.suggestedChallenges) {
      console.error("AI promptStartup did not return the expected structure (missing initialConditions or suggestedChallenges). Output was:", output);
      throw new Error("AI failed to provide complete initial data. Missing initialConditions or suggestedChallenges.");
    }

    let parsedConditions;
    let sanitizedInitialConditionsStr = output.initialConditions;
    try {
        sanitizedInitialConditionsStr = sanitizeJsonString(output.initialConditions);
        parsedConditions = JSON.parse(sanitizedInitialConditionsStr);
        // Update the output object so the client receives the sanitized (and hopefully valid) string
        output.initialConditions = sanitizedInitialConditionsStr;

        // Further validation of the parsedConditions structure can be done here if needed.
        if (parsedConditions.financials && typeof parsedConditions.financials.startingCash !== 'number') {
            console.warn(`AI returned financials.startingCash that is not a number: `, parsedConditions.financials.startingCash);
        }
         if (parsedConditions.resources && typeof parsedConditions.resources.initialFunding !== 'number') {
            console.warn(`AI returned resources.initialFunding that is not a number: `, parsedConditions.resources.initialFunding);
        }
        if (parsedConditions.financials && typeof parsedConditions.financials.estimatedInitialMonthlyBurnRate !== 'number') {
            console.warn(`AI returned financials.estimatedInitialMonthlyBurnRate that is not a number: `, parsedConditions.financials.estimatedInitialMonthlyBurnRate);
        }
        if (parsedConditions.productService && !Array.isArray(parsedConditions.productService.features)) {
            console.warn(`AI returned productService.features that is not an array: `, parsedConditions.productService.features);
        }
        if (parsedConditions.resources && !Array.isArray(parsedConditions.resources.coreTeam)) {
            console.warn(`AI returned resources.coreTeam that is not an array: `, parsedConditions.resources.coreTeam);
        }
    } catch (e) {
        const errorDetails = e instanceof Error ? e.message : String(e);
        console.error("CRITICAL: AI-generated 'initialConditions' string is NOT valid JSON even after sanitization.", e);
        console.error("Original 'initialConditions' string from AI:", output.initialConditions);
        console.error("Sanitized 'initialConditions' string attempted:", sanitizedInitialConditionsStr);
        throw new Error(
            `The AI failed to generate valid startup parameters (initialConditions was not valid JSON: ${errorDetails}). Original: ${output.initialConditions.substring(0, 200)}...`
        );
    }

    let sanitizedSuggestedChallengesStr = output.suggestedChallenges;
    try {
        sanitizedSuggestedChallengesStr = sanitizeJsonString(output.suggestedChallenges);
        JSON.parse(sanitizedSuggestedChallengesStr); // Validate parsing
        // Update the output object
        output.suggestedChallenges = sanitizedSuggestedChallengesStr;
    } catch (e) {
        const errorDetails = e instanceof Error ? e.message : String(e);
        console.error("CRITICAL: AI-generated 'suggestedChallenges' string is NOT valid JSON even after sanitization.", e);
        console.error("Original 'suggestedChallenges' string from AI:", output.suggestedChallenges);
        console.error("Sanitized 'suggestedChallenges' string attempted:", sanitizedSuggestedChallengesStr);
        throw new Error(
            `The AI failed to generate valid startup parameters (suggestedChallenges was not a valid JSON array string: ${errorDetails}). Original: ${output.suggestedChallenges.substring(0,100)}...`
        );
    }
    
    return output;
  }
);


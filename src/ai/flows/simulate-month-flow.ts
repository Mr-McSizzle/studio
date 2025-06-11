
'use server';
/**
 * @fileOverview An AI flow that simulates one month of business operations.
 * It takes the current simulation state and calculates the outcomes for the next month.
 *
 * - simulateMonth - Function to call the AI simulation flow.
 * - SimulateMonthInput - Input type for the flow.
 * - SimulateMonthOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SimulateMonthInputSchema, SimulateMonthOutputSchema, type SimulateMonthInput, type SimulateMonthOutput } from '@/types/simulation';

export async function simulateMonth(input: SimulateMonthInput): Promise<SimulateMonthOutput> {
  return simulateMonthGenkitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateMonthPrompt',
  input: { schema: SimulateMonthInputSchema },
  output: { schema: SimulateMonthOutputSchema },
  config: {
    temperature: 0.7, // Allow for more creativity but keep it somewhat grounded
     safetySettings: [ // More permissive for creative/business scenarios
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH'},
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE'},
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE'},
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE'},
    ],
  },
  prompt: `You are the core simulation engine for ForgeSim, an AI-powered business strategy platform.
Your task is to simulate one month of operations for the startup: {{{companyName}}}.
The simulation is currently in month {{{currentSimulationMonth}}}. You will calculate outcomes for the upcoming month (which will be month {{{currentSimulationMonth}}} + 1).
Strictly adhere to the JSON output schema. All monetary values should be interpreted in {{{financials.currencyCode}}}.

Current State (Month {{{currentSimulationMonth}}}):
- Financials:
  - Cash on Hand: {{{financials.currencySymbol}}}{{{financials.cashOnHand}}}
  - Last Month's Revenue: {{{financials.currencySymbol}}}{{{financials.currentRevenue}}}
  - Last Month's Expenses: {{{financials.currencySymbol}}}{{{financials.currentExpenses}}}
  - Currency: {{{financials.currencyCode}}} ({{{financials.currencySymbol}}})
- User Metrics:
  - Active Users: {{{userMetrics.activeUsers}}}
  - Churn Rate (monthly): {{{userMetrics.churnRate}}} (e.g., 0.05 means 5%)
- Product:
  - Name: (Implicit from company name)
  - Current Stage: {{{product.stage}}}
  - Development Progress towards next stage: {{{product.developmentProgress}}}%
  - Price Per User (monthly): {{{financials.currencySymbol}}}{{{product.pricePerUser}}}
- Resources:
  - Monthly Marketing Spend: {{{financials.currencySymbol}}}{{{resources.marketingSpend}}}
  - Monthly R&D Spend: {{{financials.currencySymbol}}}{{{resources.rndSpend}}}
  - Team:
    {{#each resources.team}}
    - {{{count}}}x {{{role}}} (Salary: {{{../financials.currencySymbol}}}{{{salary}}}/month each)
    {{/each}}
- Market:
  - Competition Level: {{{market.competitionLevel}}}
  - Target Market: {{{market.targetMarketDescription}}}
- Current Startup Score: {{{currentStartupScore}}}/100

Simulation Logic Guidelines for the NEXT MONTH (Month {{{currentSimulationMonth}}} + 1):

1.  **User Base Calculation:**
    *   Users Lost to Churn: Round (Current Active Users * Churn Rate) to the nearest whole number.
    *   New User Acquisition: This is more nuanced. Consider:
        *   Base acquisition from marketing: (Marketing Spend / 50) * (product appeal modifier).
        *   Product appeal modifier: idea=0.2, prototype=0.5, mvp=1.0, growth=1.5, mature=1.2. (Adjust based on product stage).
        *   Word-of-mouth: (Current Active Users / 1000) * (product appeal modifier).
        *   Competition: If 'high', reduce acquisition by 20-30%. If 'low', increase by 10-20%.
        *   Ensure newUserAcquisition is a whole number.
    *   Updated Active Users = Current Active Users - Churned Users + New User Acquisition. Cannot be negative.

2.  **Financial Calculations:**
    *   Calculated Revenue = Updated Active Users * Price Per User.
    *   Total Salaries = Sum of (count * salary) for all team members.
    *   Calculated Expenses = Total Salaries + Marketing Spend + R&D Spend + BaseOperationalCosts (assume BaseOperationalCosts = 1500 {{{financials.currencyCode}}} for this simulation, unless cash is very low, then try to reduce it slightly if plausible).
    *   Profit Or Loss = Calculated Revenue - CalculatedExpenses.
    *   Updated Cash On Hand = Current Cash On Hand + Profit Or Loss.

3.  **Product Development:**
    *   Progress Delta: (R&D Spend / 200) + (Number of 'Engineer' roles * 2). Cap delta at 25% per month. Example: If R&D is 1000 and 2 engineers, progress = (1000/200) + (2*2) = 5 + 4 = 9%.
    *   Total Progress = Current Development Progress + Progress Delta.
    *   Stage Advancement: If Total Progress >= 100:
        *   If current stage is 'idea', new stage is 'prototype'. Reset progress to 0.
        *   If 'prototype' -> 'mvp'. Reset progress to 0.
        *   If 'mvp' -> 'growth'. Reset progress to 0.
        *   If 'growth' -> 'mature'. Reset progress to 0 (or cap at 100, development might slow).
        *   If 'mature', progress can still occur slowly (e.g., cap delta at 5%) or new features can be conceptualized.
        *   Set 'newProductStage' in output if advancement occurs. Otherwise, omit it.

4.  **Key Events Generated (Exactly 2):**
    *   Generate two distinct, plausible short string events. These can be positive, negative, or neutral. One of these events SHOULD highlight a key achievement or milestone if one occurred (e.g., "Reached 1000 active users!", "Product successfully advanced to MVP stage.").
    *   Examples: "Unexpected viral mention on social media boosts brand awareness.", "Key supplier increased prices by 10%.", "Competitor X launched a similar product.", "Team morale is exceptionally high after a successful sprint."
    *   These should be concise and impactful.

5.  **Rewards Granted (Optional):**
    *   If a major milestone was achieved (e.g., significant user growth, product stage advancement, first profitability), you can grant 1-2 thematic rewards.
    *   Provide a 'name' (e.g., "MVP Launch Bonus") and 'description' (e.g., "Successfully launched the Minimum Viable Product.") for each reward.
    *   These rewards should be reflected in the Startup Score Adjustment. If no significant rewardable milestone, omit the 'rewardsGranted' field or set it to an empty array.

6.  **Startup Score Adjustment:**
    *   Base on overall performance and any achievements/rewards. Consider:
        *   Profitability: Positive profit = +1 to +3. Significant loss = -1 to -3.
        *   Cash Flow: If cash on hand becomes critically low (e.g., < 1 month burn rate if burn rate is positive) = -2 to -5. Significant cash increase = +1 to +2.
        *   User Growth: Strong positive user growth = +1 to +3. Stagnation or loss = -1.
        *   Product Milestones: Advancing product stage or other major achievements = +3 to +5.
        *   Max score is 100, min is 0. The adjustment should be an integer.

Output MUST be a single, valid JSON object matching the SimulateMonthOutputSchema.
The 'simulatedMonthNumber' in your output should be {{{currentSimulationMonth}}} + 1.
Ensure all calculations are logical and reflect the inputs. Be realistic but allow for some variability.
Do not add any explanations or text outside the JSON structure.
Focus on the calculations and event generation.
The output JSON should look like this (example values):
{{output}}
`
});

const simulateMonthGenkitFlow = ai.defineFlow(
  {
    name: 'simulateMonthGenkitFlow',
    inputSchema: SimulateMonthInputSchema,
    outputSchema: SimulateMonthOutputSchema,
  },
  async (input: SimulateMonthInput): Promise<SimulateMonthOutput> => {
    // Increment the month for the AI's context, it will confirm this in its output.
    const targetSimulatedMonth = input.currentSimulationMonth + 1;
    
    let currentProductStageForAI = input.product.stage;
    const validStages: SimulateMonthInput['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];
    if (!validStages.includes(currentProductStageForAI)) {
        if (String(currentProductStageForAI).toLowerCase() === 'concept') {
            currentProductStageForAI = 'idea';
        } else {
            console.warn(`Invalid product stage "${currentProductStageForAI}" detected before AI call. Defaulting to "idea".`);
            currentProductStageForAI = 'idea';
        }
    }

    const flowInputForPrompt = {
      ...input,
      product: {
        ...input.product,
        stage: currentProductStageForAI,
      }
      // The AI is prompted with currentSimulationMonth, and expected to output for targetSimulatedMonth
    };

    const {output} = await prompt(flowInputForPrompt);

    if (!output) {
      console.error("AI simulateMonthFlow did not return any output.");
      throw new Error("AI simulation failed to produce an output.");
    }
    
    // Basic validation, Zod schema validation is handled by definePrompt
    if (output.simulatedMonthNumber !== targetSimulatedMonth) {
        console.warn(`AI returned month ${output.simulatedMonthNumber}, expected ${targetSimulatedMonth}. Proceeding with AI's month.`);
        // Or throw an error if strict month progression is required.
    }

    return output;
  }
);


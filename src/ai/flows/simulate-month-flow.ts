
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
    temperature: 0.7, // Increased temperature for more varied outcomes
     safetySettings: [ // Adjusted safety settings for broader content generation
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE'},
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
    *   New User Acquisition: Nuanced. Consider marketing spend (e.g., Marketing Spend / 50 for base, modified by product stage appeal: idea=0.2, prototype=0.5, mvp=1.0, growth=1.5, mature=1.2), word-of-mouth (e.g., Current Active Users / 1000 * product appeal), and competition (high competition reduces acquisition, low increases it). Ensure newUserAcquisition is a whole number. If marketing spend is zero, acquisition is minimal.
    *   Updated Active Users = Current Active Users - Churned Users + New User Acquisition. Cannot be negative.

2.  **Financial Calculations:**
    *   Calculated Revenue = Updated Active Users * Price Per User.
    *   Expense Breakdown & Total Expenses:
        *   Provide a detailed 'expenseBreakdown' with 'salaries', 'marketing', 'rnd', and 'operational' costs.
        *   'expenseBreakdown.salaries': Sum of (count * salary) for all team members.
        *   'expenseBreakdown.marketing': Current {{{resources.marketingSpend}}}.
        *   'expenseBreakdown.rnd': Current {{{resources.rndSpend}}}.
        *   'expenseBreakdown.operational': Estimate other operational costs (rent, utilities, software, etc.) appropriate for a startup of this nature, scale, team size, and current activities.
        *   **Crucially, be mindful of 'cashOnHand'. If 'cashOnHand' is very low (e.g., less than 2-3 months of typical burn rate *before* new revenue), the startup would implement emergency cost-cutting. Reflect this by significantly reducing 'expenseBreakdown.operational'. If cash is extremely low (e.g., less than 1 month's typical burn), consider if marketing or R&D spend should be realistically reduced or frozen for this month in your calculation of 'expenseBreakdown.marketing'/'expenseBreakdown.rnd', and reflect this in a key event if it occurs.**
        *   'calculatedExpenses': This MUST be the sum of 'expenseBreakdown.salaries' + 'expenseBreakdown.marketing' + 'expenseBreakdown.rnd' + 'expenseBreakdown.operational'.
    *   Profit Or Loss = Calculated Revenue - CalculatedExpenses.
    *   Updated Cash On Hand = Current Cash On Hand + Profit Or Loss.

3.  **Product Development:**
    *   Progress Delta: (R&D Spend / 200) + (Number of 'Engineer' roles * 2). Cap delta at 25% per month. If R&D spend is zero, progress comes mainly from engineers.
    *   Total Progress = Current Development Progress + Progress Delta.
    *   Stage Advancement: If Total Progress >= 100 and current stage is not 'mature': advance to next stage ('idea' -> 'prototype' -> 'mvp' -> 'growth' -> 'mature'). Reset progress to 0 (or cap at 100 for 'mature'). Set 'newProductStage' if advancement occurs.

4.  **Key Events Generated (Exactly 2):**
    *   Generate two distinct, plausible short string events (positive, negative, neutral). One should highlight a key achievement/milestone if one occurred (e.g., "Reached 1000 active users!", "Product successfully advanced to MVP stage.").
    *   If 'cashOnHand' becomes critically low or negative, one event MUST clearly reflect this financial distress.
    *   Examples: "Unexpected viral mention.", "Key supplier increased prices.", "Competitor X launched a similar product."

5.  **Rewards Granted (Optional):**
    *   If a major milestone was achieved (e.g., significant user growth, product stage advancement, first profitability), grant 1-2 thematic rewards (name, description). Reflected in Startup Score.

6.  **Startup Score Adjustment:**
    *   Integer adjustment based on overall performance (profitability, cash flow, user growth, product milestones, rewards).
    *   Positive profit = +1 to +3. Significant loss = -1 to -3.
    *   Critically low cash (<1 month burn) = -5 to -10. Significant cash increase = +1 to +2. Negative cash = substantial penalty (-10 or more).
    *   Strong user growth = +1 to +3. Stagnation/loss = -1.
    *   Product Milestones/Rewards = +3 to +5.
    *   Max score 100, min 0.
    
7.  **AI Reasoning (Optional):**
    *   Provide a brief, 1-2 sentence explanation in the 'aiReasoning' field summarizing your key considerations or calculations for this month's outcomes. Example: "Increased marketing led to strong user growth, but R&D was constrained due to cash flow, slowing product development." This should be a high-level overview.

Output MUST be a single, valid JSON object matching the SimulateMonthOutputSchema.
The 'simulatedMonthNumber' in your output should be {{{currentSimulationMonth}}} + 1.
Ensure the sum of your 'expenseBreakdown' components equals 'calculatedExpenses'.
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
    const targetSimulatedMonth = input.currentSimulationMonth + 1;

    let currentProductStageForAI = input.product.stage;
    const validStages: SimulateMonthInput['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];
    if (!validStages.includes(currentProductStageForAI)) {
        if (String(currentProductStageForAI).toLowerCase() === 'concept') {
            currentProductStageForAI = 'idea';
        } else {
            console.warn(`Invalid product stage "${currentProductStageForAI}" detected before AI call in simulateMonthFlow. Defaulting to "idea".`);
            currentProductStageForAI = 'idea';
        }
    }

    const flowInputForPrompt = {
      ...input,
      product: {
        ...input.product,
        stage: currentProductStageForAI,
      }
    };

    const {output} = await prompt(flowInputForPrompt);

    if (!output) {
      console.error("AI simulateMonthFlow did not return any output.");
      throw new Error("AI simulation failed to produce an output.");
    }

    if (output.simulatedMonthNumber !== targetSimulatedMonth) {
        console.warn(`AI returned month ${output.simulatedMonthNumber}, expected ${targetSimulatedMonth}. Proceeding with AI's month.`);
    }

    // Make expenseBreakdown authoritative
    if (output.expenseBreakdown) {
        const breakdownSum = output.expenseBreakdown.salaries + output.expenseBreakdown.marketing + output.expenseBreakdown.rnd + output.expenseBreakdown.operational;
        if (Math.abs(breakdownSum - output.calculatedExpenses) > 0.01) { // Allow for small floating point differences
            console.warn(`AI expenseBreakdown sum (${breakdownSum}) does not match AI's calculatedExpenses (${output.calculatedExpenses}). Overriding calculatedExpenses with breakdown sum.`);
        }
        // Set calculatedExpenses to the sum of the breakdown for consistency
        output.calculatedExpenses = breakdownSum;
        
        // Recalculate profitOrLoss based on the authoritative calculatedExpenses
        output.profitOrLoss = output.calculatedRevenue - output.calculatedExpenses;
        
        // Recalculate updatedCashOnHand based on the authoritative profitOrLoss
        // Note: cashOnHand from input is currentState.financials.cashOnHand
        output.updatedCashOnHand = input.financials.cashOnHand + output.profitOrLoss;

    } else {
        console.error("AI simulateMonthFlow did not return expenseBreakdown. This is required.");
        // If AI fails to provide breakdown, construct a placeholder to avoid total failure,
        // though this indicates a flaw in AI's adherence to schema.
        const placeholderSalaries = input.resources.team.reduce((acc, member) => acc + (member.count * member.salary), 0);
        const placeholderOperational = Math.max(0, output.calculatedExpenses - (placeholderSalaries + input.resources.marketingSpend + input.resources.rndSpend));
        output.expenseBreakdown = {
            salaries: placeholderSalaries,
            marketing: input.resources.marketingSpend,
            rnd: input.resources.rndSpend,
            operational: placeholderOperational
        };
        // Recalculate profitOrLoss and updatedCashOnHand if we had to create a placeholder breakdown
        output.profitOrLoss = output.calculatedRevenue - output.calculatedExpenses;
        output.updatedCashOnHand = input.financials.cashOnHand + output.profitOrLoss;
    }

    return output;
  }
);

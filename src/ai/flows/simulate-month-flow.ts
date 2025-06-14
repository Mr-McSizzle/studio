
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
import { SimulateMonthInputSchema, SimulateMonthOutputSchema, type SimulateMonthInput, type SimulateMonthOutput, KeyEventCategoryEnum, KeyEventImpactEnum } from '@/types/simulation';

export async function simulateMonth(input: SimulateMonthInput): Promise<SimulateMonthOutput> {
  return simulateMonthGenkitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateMonthPrompt',
  input: { schema: SimulateMonthInputSchema },
  output: { schema: SimulateMonthOutputSchema },
  config: {
    temperature: 0.75, 
     safetySettings: [ 
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
  - Current Stage: {{{product.stage}}} (idea, prototype, mvp, growth, mature)
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
  - Competition Level: {{{market.competitionLevel}}} (low, moderate, high)
  - Target Market: {{{market.targetMarketDescription}}}
- Current Startup Score: {{{currentStartupScore}}}/100

Simulation Logic Guidelines for the NEXT MONTH (Month {{{currentSimulationMonth}}} + 1):

1.  **User Base Calculation:**
    *   Users Lost to Churn: Round (Current Active Users * Churn Rate) to the nearest whole number. Churn can slightly increase if the product stage is very early (idea/prototype) or if sustained financial distress is apparent (low cash for multiple months).
    *   New User Acquisition: This is nuanced.
        *   Base Acquisition: Factor in marketing spend. Higher spend generally means more reach, but effectiveness (Cost Per Acquisition) can decrease if the product is not mature (idea/prototype) or if competition ({{{market.competitionLevel}}}) is high. A very high spend on an 'idea' stage product might yield poor ROI.
        *   Product Appeal: A more mature product (mvp, growth) with good development progress ({{{product.developmentProgress}}}%) should have better appeal than an 'idea' or 'prototype' stage product. Word-of-mouth (e.g., Current Active Users / 1000 * product appeal factor) should also reflect this.
        *   Price Impact: Higher price ({{{financials.currencySymbol}}}{{{product.pricePerUser}}}) might reduce acquisition if perceived value is low or competition offers similar value for less. Lower price might boost it.
        *   Market Conditions: If '{{{market.targetMarketDescription}}}' suggests a rapidly growing market, slightly boost acquisition. High '{{{market.competitionLevel}}}' should slightly dampen it.
        *   Ensure 'newUserAcquisition' is a whole number. Minimal acquisition if marketing spend is zero.

2.  **Financial Calculations:**
    *   Calculated Revenue = Updated Active Users * Price Per User.
    *   Expense Breakdown & Total Expenses:
        *   Provide 'expenseBreakdown' (salaries, marketing, rnd, operational).
        *   'salaries': Sum of (count * salary) for all team members.
        *   'marketing': Current {{{resources.marketingSpend}}}.
        *   'rnd': Current {{{resources.rndSpend}}}.
        *   'operational': Estimate realistic costs for a startup of this nature. Consider team size.
        *   **Cash Flow Management:** If 'cashOnHand' is very low (e.g., < 2 months of typical burn rate), the startup MUST implement emergency cost-cutting. Reflect this by significantly reducing 'expenseBreakdown.operational'. If cash is extremely low (< 1 month burn), consider if marketing or R&D spend should be realistically frozen or drastically reduced in 'expenseBreakdown.marketing'/'expenseBreakdown.rnd' for this month, and reflect this in a key event if it occurs (e.g., event description: "Emergency cost-cutting: Marketing budget frozen due to low cash reserves.", category: 'Financial', impact: 'Negative').
        *   'calculatedExpenses': MUST be sum of 'expenseBreakdown' components.
    *   Profit Or Loss = Calculated Revenue - CalculatedExpenses.
    *   Updated Cash On Hand = Current Cash On Hand + Profit OrLoss.

3.  **Product Development:**
    *   Progress Delta: (R&D Spend / (200 + ({{{product.stage}}} === 'idea' || {{{product.stage}}} === 'prototype' ? 100 : 0) ) ) + (Number of 'Engineer' roles * (2 + ({{{product.stage}}} === 'mvp' || {{{product.stage}}} === 'growth' ? 1 : 0) ) ).
        *   R&D on early-stage products ('idea', 'prototype') is less efficient. Engineer effectiveness increases slightly for 'mvp' and 'growth' stages.
        *   High R&D spend with few engineers might be inefficient. Low R&D spend might still see progress if many engineers are present.
        *   Cap monthly delta at 20-25% to prevent unrealistic jumps. If R&D spend is zero, progress is mainly from engineers but slower.
    *   Total Progress = Current Development Progress + Progress Delta.
    *   Stage Advancement: If Total Progress >= 100 and current stage is not 'mature': advance to next stage ('idea' -> 'prototype' -> 'mvp' -> 'growth' -> 'mature'). Reset progress to 0. Set 'newProductStage'.

4.  **Key Events Generated (Exactly 2, structured objects):**
    *   Generate two distinct, context-aware events. Each event must be an object with 'description', 'category', and 'impact'.
    *   Valid categories: ${KeyEventCategoryEnum.options.join(', ')}.
    *   Valid impacts: ${KeyEventImpactEnum.options.join(', ')}.
    *   **Event 1 (Internal/Decision-Related):** Tied to the company's current situation, recent decisions, or significant outcomes this month.
        Example: { description: "Feature X development completed ahead of schedule.", category: "Product", impact: "Positive" }
    *   **Event 2 (External/Market-Related):** Can be a general market, operational, or competitor event.
        Example: { description: "Key competitor Y launched a new product.", category: "Market", impact: "Negative" }
    *   Do NOT include the impact text like '(Positive)' within the event 'description' field.

5.  **Rewards Granted (Optional):**
    *   If a major milestone was achieved (significant user growth, product stage advancement, first profitability, successful navigation of a crisis revealed in events), grant 1-2 thematic rewards.

6.  **Startup Score Adjustment:**
    *   Integer adjustment based on overall performance (profitability, cash flow, user growth, product milestones, event impacts).
    *   Positive profit = +1 to +3. Significant loss = -1 to -3.
    *   Critically low cash (<1 month burn) OR negative cash = -5 to -15. Significant cash increase = +1 to +3.
    *   Strong user growth (relative to stage/spend) = +1 to +3. Stagnation/loss = -1 to -2.
    *   Product Milestones/Rewards = +3 to +5.
    *   Negative impact events should reduce score (-1 to -3 per significant negative event). Positive impact events can slightly boost it (+1 to +2).
    *   Max score 100, min 0.

7.  **AI Reasoning (Optional):**
    *   Provide a brief, 1-2 sentence explanation summarizing your key considerations for *user acquisition rates*, *product development speed*, or *financial calculations* this month, especially if they were significantly influenced by the new nuanced logic. Example: "User growth was modest despite marketing spend due to high competition and early product stage. R&D progress was solid thanks to focused engineering effort."

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

    let {output} = await prompt(flowInputForPrompt);

    if (!output) {
      console.error("AI simulateMonthFlow did not return any output.");
      throw new Error("AI simulation failed to produce an output.");
    }

    if (output.simulatedMonthNumber !== targetSimulatedMonth) {
        console.warn(`AI returned month ${output.simulatedMonthNumber}, expected ${targetSimulatedMonth}. Proceeding with AI's month.`);
    }

    // Make expenseBreakdown authoritative and ensure consistency
    if (output.expenseBreakdown) {
        const breakdownSum = output.expenseBreakdown.salaries + output.expenseBreakdown.marketing + output.expenseBreakdown.rnd + output.expenseBreakdown.operational;
        if (Math.abs(breakdownSum - output.calculatedExpenses) > 0.01) { // Allow for small floating point differences
            console.warn(`AI expenseBreakdown sum (${breakdownSum}) does not match AI's calculatedExpenses (${output.calculatedExpenses}). Overriding calculatedExpenses with breakdown sum.`);
        }
        output.calculatedExpenses = breakdownSum;
        output.profitOrLoss = output.calculatedRevenue - output.calculatedExpenses;
        output.updatedCashOnHand = input.financials.cashOnHand + output.profitOrLoss;

    } else {
        console.error("AI simulateMonthFlow did not return expenseBreakdown. This is required.");
        const placeholderSalaries = input.resources.team.reduce((acc, member) => acc + (member.count * member.salary), 0);
        const placeholderOperational = Math.max(0, output.calculatedExpenses - (placeholderSalaries + input.resources.marketingSpend + input.resources.rndSpend));
        output.expenseBreakdown = {
            salaries: placeholderSalaries,
            marketing: input.resources.marketingSpend,
            rnd: input.resources.rndSpend,
            operational: placeholderOperational
        };
        output.profitOrLoss = output.calculatedRevenue - output.calculatedExpenses;
        output.updatedCashOnHand = input.financials.cashOnHand + output.profitOrLoss;
    }
    
    // Validate AI-generated events structure
    if (output.keyEventsGenerated && Array.isArray(output.keyEventsGenerated)) {
        output.keyEventsGenerated.forEach(event => {
            if (!event.description || !event.category || !event.impact) {
                console.warn("AI returned a malformed key event:", event);
                // Attempt to fix or default malformed event
                event.description = event.description || "Unspecified event from AI";
                event.category = KeyEventCategoryEnum.Values.General; // Default category
                event.impact = KeyEventImpactEnum.Values.Neutral; // Default impact
            }
            if (typeof event.description !== 'string' || !KeyEventCategoryEnum.safeParse(event.category).success || !KeyEventImpactEnum.safeParse(event.impact).success) {
                console.warn("AI returned an event with invalid category or impact type:", event);
                event.category = KeyEventCategoryEnum.Values.General;
                event.impact = KeyEventImpactEnum.Values.Neutral;
            }
        });
         if (output.keyEventsGenerated.length !== 2) {
            console.warn(`AI returned ${output.keyEventsGenerated.length} events, expected 2. Padding/truncating if necessary.`);
            // Basic padding/truncating - could be more sophisticated
            while(output.keyEventsGenerated.length < 2) {
                output.keyEventsGenerated.push({description: "Placeholder event due to AI under-generation.", category: "General", impact: "Neutral"});
            }
            if(output.keyEventsGenerated.length > 2) {
                output.keyEventsGenerated = output.keyEventsGenerated.slice(0, 2);
            }
        }
    } else {
        console.error("AI did not return keyEventsGenerated or it was not an array. Creating default events.");
        output.keyEventsGenerated = [
            {description: "AI failed to generate primary event for the month.", category: "System", impact: "Neutral"},
            {description: "AI failed to generate secondary event for the month.", category: "System", impact: "Neutral"}
        ];
    }


    return output;
  }
);


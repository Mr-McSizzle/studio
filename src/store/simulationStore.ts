import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { 
  DigitalTwinState, 
  FinancialMetrics, 
  UserMetrics, 
  ProductDetails, 
  Resources, 
  MarketConditions, 
  StructuredKeyEvent, 
  Reward, 
  Mission, 
  SimulateMonthInput, 
  SimulateMonthOutput,
  RevenueDataPoint,
  UserDataPoint,
  HistoricalDataPoint,
  ExpenseBreakdownDataPoint,
  SimulationSnapshot,
  FounderArchetype,
  ActiveSurpriseEvent,
  SurpriseEventHistoryItem,
} from '@/types/simulation';
import { simulateMonth } from '@/ai/flows/simulate-month-flow';
import type { PromptStartupOutput } from '@/ai/flows/prompt-startup';

// Initial state for the simulation
const initialDigitalTwinState: DigitalTwinState = {
  simulationMonth: 0,
  companyName: "Your New Venture",
  financials: {
    revenue: 0,
    expenses: 5000,
    profit: -5000,
    burnRate: 5000,
    cashOnHand: 50000,
    fundingRaised: 50000,
    currencyCode: "USD",
    currencySymbol: "$",
  },
  userMetrics: {
    activeUsers: 0,
    newUserAcquisitionRate: 0,
    customerAcquisitionCost: 20,
    churnRate: 0.05,
    monthlyRecurringRevenue: 0,
  },
  product: {
    name: "Unnamed Product/Service",
    stage: 'idea',
    features: ["Core Concept"],
    developmentProgress: 10,
    pricePerUser: 9.99,
  },
  resources: {
    initialBudget: 50000,
    marketingSpend: 1000,
    rndSpend: 1000,
    team: [{ role: 'Founder', count: 1, salary: 0 }],
  },
  market: {
    targetMarketDescription: "Not yet defined.",
    marketSize: 100000,
    competitionLevel: 'moderate',
  },
  startupScore: 10,
  keyEvents: [],
  rewards: [],
  earnedBadges: [],
  missions: [],
  initialGoals: [],
  suggestedChallenges: [],
  isInitialized: false,
  currentAiReasoning: null,
  selectedArchetype: undefined,
  
  // Historical data for charts
  historicalRevenue: [],
  historicalUserGrowth: [],
  historicalBurnRate: [],
  historicalNetProfitLoss: [],
  historicalExpenseBreakdown: [],
  historicalCAC: [],
  historicalChurnRate: [],
  historicalProductProgress: [],
  
  // Sandbox experiment state
  sandboxState: null,
  isSandboxing: false,
  sandboxRelativeMonth: 0,
  
  // Surprise event system
  activeSurpriseEvent: null,
  surpriseEventHistory: [],
  activeScenarios: [],
};

// Define the store type
interface SimulationStore extends DigitalTwinState {
  // Core simulation actions
  initializeSimulation: (aiOutput: PromptStartupOutput, startupNameIdea: string, targetMarket: string, budget: string, currencyCode: string, selectedArchetype?: FounderArchetype) => void;
  advanceMonth: () => Promise<void>;
  resetSimulation: () => void;
  
  // Decision levers
  setMarketingSpend: (amount: number) => void;
  setRndSpend: (amount: number) => void;
  setPricePerUser: (price: number) => void;
  adjustTeamMemberCount: (role: string, delta: number, salary?: number) => void;
  
  // Mission management
  toggleMissionCompletion: (missionId: string) => void;
  setMissions: (missions: Omit<Mission, 'id' | 'isCompleted'>[]) => void;
  
  // Sandbox functionality
  startSandboxExperiment: () => void;
  discardSandboxExperiment: () => void;
  simulateMonthInSandbox: () => Promise<void>;
  applySandboxDecisionsToMain: () => void;
  setSandboxMarketingSpend: (amount: number) => void;
  setSandboxRndSpend: (amount: number) => void;
  setSandboxPricePerUser: (price: number) => void;
  adjustSandboxTeamMemberCount: (role: string, delta: number, salary?: number) => void;
  
  // Snapshot management
  saveCurrentSimulation: (name: string) => SimulationSnapshot | null;
  loadSimulation: (snapshotId: string) => DigitalTwinState | null;
  deleteSavedSimulation: (snapshotId: string) => void;
  savedSimulations: SimulationSnapshot[];
  
  // Scenario management
  addScenario: (scenario: string) => void;
  removeScenario: (scenario: string) => void;
  
  // Surprise event system
  triggerSurpriseEvent: (event: ActiveSurpriseEvent) => void;
  resolveSurpriseEvent: (outcome: 'accepted' | 'rejected') => void;
  
  // Badge system
  awardQuestBadge: (name: string, description: string, questId: string, iconName?: string) => void;
}

export const useSimulationStore = create<SimulationStore>()(
  persist(
    (set, get) => ({
      ...initialDigitalTwinState,
      savedSimulations: [],
      
      initializeSimulation: (aiOutput, startupNameIdea, targetMarket, budget, currencyCode, selectedArchetype) => {
        try {
          // Parse the AI output
          const initialConditions = JSON.parse(aiOutput.initialConditions);
          const suggestedChallenges = JSON.parse(aiOutput.suggestedChallenges);
          
          // Determine company name from AI output or user input
          const companyName = initialConditions.companyName || startupNameIdea;
          
          // Determine product name from AI output or company name
          const productName = initialConditions.productService?.name || companyName + " Product";
          
          // Parse initial funding/budget
          const initialFunding = typeof initialConditions.resources?.initialFunding === 'number' 
            ? initialConditions.resources.initialFunding 
            : parseFloat(budget);
          
          // Determine currency symbol based on code
          let currencySymbol = "$";
          if (currencyCode === "EUR") currencySymbol = "€";
          else if (currencyCode === "GBP") currencySymbol = "£";
          else if (currencyCode === "JPY") currencySymbol = "¥";
          
          // Create initial team from AI output or default to founder
          const initialTeam = Array.isArray(initialConditions.resources?.coreTeam) 
            ? initialConditions.resources.coreTeam 
            : [{ role: 'Founder', count: 1, salary: 0 }];
          
          // Calculate initial burn rate
          const initialBurnRate = typeof initialConditions.financials?.estimatedInitialMonthlyBurnRate === 'number'
            ? initialConditions.financials.estimatedInitialMonthlyBurnRate
            : 5000; // Default
          
          // Generate initial missions based on suggested challenges
          const initialMissions: Mission[] = suggestedChallenges.slice(0, 3).map((challenge: string, index: number) => ({
            id: `initial-mission-${index}`,
            title: `Initial Challenge ${index + 1}`,
            description: challenge,
            rewardText: `+${5 + index} Startup Score`,
            isCompleted: false,
          }));
          
          // Set the initial state
          set({
            isInitialized: true,
            companyName,
            selectedArchetype,
            financials: {
              revenue: 0,
              expenses: initialBurnRate,
              profit: -initialBurnRate,
              burnRate: initialBurnRate,
              cashOnHand: initialFunding,
              fundingRaised: initialFunding,
              currencyCode,
              currencySymbol,
            },
            userMetrics: {
              activeUsers: 0,
              newUserAcquisitionRate: 0,
              customerAcquisitionCost: initialConditions.financials?.targetCAC || 20,
              churnRate: 0.05,
              monthlyRecurringRevenue: 0,
            },
            product: {
              name: productName,
              stage: initialConditions.productService?.initialDevelopmentStage || 'idea',
              features: initialConditions.productService?.features || ["Core Concept"],
              developmentProgress: 10,
              pricePerUser: initialConditions.productService?.pricePerUser || 9.99,
            },
            resources: {
              initialBudget: initialFunding,
              marketingSpend: initialConditions.resources?.marketingSpend || 1000,
              rndSpend: initialConditions.resources?.rndSpend || 1000,
              team: initialTeam,
            },
            market: {
              targetMarketDescription: targetMarket,
              marketSize: initialConditions.market?.estimatedSize || 100000,
              competitionLevel: 'moderate',
            },
            initialGoals: initialConditions.initialGoals || [],
            suggestedChallenges,
            missions: initialMissions,
            keyEvents: [{
              id: uuidv4(),
              timestamp: new Date().toISOString(),
              month: 0,
              description: `${companyName} founded with initial funding of ${currencySymbol}${initialFunding.toLocaleString()}.`,
              category: 'Financial',
              impact: 'Positive',
            }],
            startupScore: 10,
          });
          
          // Initialize historical data
          const state = get();
          set({
            historicalRevenue: [{ month: `M${state.simulationMonth}`, revenue: state.financials.revenue, desktop: state.financials.revenue }],
            historicalUserGrowth: [{ month: `M${state.simulationMonth}`, users: state.userMetrics.activeUsers, desktop: state.userMetrics.activeUsers }],
            historicalBurnRate: [{ month: `M${state.simulationMonth}`, value: state.financials.burnRate, desktop: state.financials.burnRate }],
            historicalNetProfitLoss: [{ month: `M${state.simulationMonth}`, value: state.financials.profit, desktop: state.financials.profit }],
            historicalCAC: [{ month: `M${state.simulationMonth}`, value: state.userMetrics.customerAcquisitionCost, desktop: state.userMetrics.customerAcquisitionCost }],
            historicalChurnRate: [{ month: `M${state.simulationMonth}`, value: state.userMetrics.churnRate * 100, desktop: state.userMetrics.churnRate * 100 }],
            historicalProductProgress: [{ month: `M${state.simulationMonth}`, value: state.product.developmentProgress, desktop: state.product.developmentProgress }],
            historicalExpenseBreakdown: [{
              month: `M${state.simulationMonth}`,
              salaries: initialTeam.reduce((acc, member) => acc + (member.count * member.salary), 0),
              marketing: state.resources.marketingSpend,
              rnd: state.resources.rndSpend,
              operational: state.financials.expenses - (
                initialTeam.reduce((acc, member) => acc + (member.count * member.salary), 0) +
                state.resources.marketingSpend +
                state.resources.rndSpend
              ),
            }],
          });
          
        } catch (error) {
          console.error("Error initializing simulation:", error);
          throw new Error(`Failed to initialize simulation: ${error}`);
        }
      },
      
      advanceMonth: async () => {
        const state = get();
        if (!state.isInitialized || state.financials.cashOnHand <= 0) {
          console.error("Cannot advance month: simulation not initialized or out of cash");
          return;
        }
        
        try {
          // Prepare input for the AI simulation
          const input: SimulateMonthInput = {
            currentSimulationMonth: state.simulationMonth,
            companyName: state.companyName,
            financials: {
              cashOnHand: state.financials.cashOnHand,
              currentRevenue: state.financials.revenue,
              currentExpenses: state.financials.expenses,
              currencyCode: state.financials.currencyCode,
              currencySymbol: state.financials.currencySymbol,
            },
            userMetrics: {
              activeUsers: state.userMetrics.activeUsers,
              churnRate: state.userMetrics.churnRate,
            },
            product: {
              stage: state.product.stage,
              developmentProgress: state.product.developmentProgress,
              pricePerUser: state.product.pricePerUser,
            },
            resources: {
              marketingSpend: state.resources.marketingSpend,
              rndSpend: state.resources.rndSpend,
              team: state.resources.team,
            },
            market: {
              competitionLevel: state.market.competitionLevel,
              targetMarketDescription: state.market.targetMarketDescription,
            },
            currentStartupScore: state.startupScore,
            activeScenarios: state.activeScenarios,
          };
          
          // Call the AI to simulate the month
          const result = await simulateMonth(input);
          
          // Process the AI output
          const newSimulationMonth = state.simulationMonth + 1;
          const newCashOnHand = result.updatedCashOnHand;
          const newActiveUsers = result.updatedActiveUsers;
          const newRevenue = result.calculatedRevenue;
          const newExpenses = result.calculatedExpenses;
          const newProfit = result.profitOrLoss;
          const newBurnRate = Math.max(0, -newProfit);
          const newProductStage = result.newProductStage || state.product.stage;
          const newDevelopmentProgress = result.newProductStage ? 0 : state.product.developmentProgress + result.productDevelopmentDelta;
          const newStartupScore = Math.max(0, Math.min(100, state.startupScore + result.startupScoreAdjustment));
          
          // Process key events
          const newKeyEvents: StructuredKeyEvent[] = [
            ...state.keyEvents,
            ...result.keyEventsGenerated.map(event => ({
              id: uuidv4(),
              timestamp: new Date().toISOString(),
              month: newSimulationMonth,
              description: event.description,
              category: event.category,
              impact: event.impact,
            })),
          ];
          
          // Process rewards
          const newRewards: Reward[] = [
            ...state.rewards,
            ...(result.rewardsGranted || []).map(reward => ({
              id: uuidv4(),
              name: reward.name,
              description: reward.description,
              dateEarned: new Date().toISOString(),
            })),
          ];
          
          // Update historical data
          const newHistoricalRevenue: RevenueDataPoint[] = [
            ...state.historicalRevenue,
            { month: `M${newSimulationMonth}`, revenue: newRevenue, desktop: newRevenue },
          ];
          
          const newHistoricalUserGrowth: UserDataPoint[] = [
            ...state.historicalUserGrowth,
            { month: `M${newSimulationMonth}`, users: newActiveUsers, desktop: newActiveUsers },
          ];
          
          const newHistoricalBurnRate: HistoricalDataPoint[] = [
            ...state.historicalBurnRate,
            { month: `M${newSimulationMonth}`, value: newBurnRate, desktop: newBurnRate },
          ];
          
          const newHistoricalNetProfitLoss: HistoricalDataPoint[] = [
            ...state.historicalNetProfitLoss,
            { month: `M${newSimulationMonth}`, value: newProfit, desktop: newProfit },
          ];
          
          const newHistoricalCAC: HistoricalDataPoint[] = [
            ...state.historicalCAC,
            { 
              month: `M${newSimulationMonth}`, 
              value: result.newUserAcquisition > 0 
                ? state.resources.marketingSpend / result.newUserAcquisition 
                : state.userMetrics.customerAcquisitionCost,
              desktop: result.newUserAcquisition > 0 
                ? state.resources.marketingSpend / result.newUserAcquisition 
                : state.userMetrics.customerAcquisitionCost,
            },
          ];
          
          const newHistoricalChurnRate: HistoricalDataPoint[] = [
            ...state.historicalChurnRate,
            { month: `M${newSimulationMonth}`, value: state.userMetrics.churnRate * 100, desktop: state.userMetrics.churnRate * 100 },
          ];
          
          const newHistoricalProductProgress: HistoricalDataPoint[] = [
            ...state.historicalProductProgress,
            { month: `M${newSimulationMonth}`, value: newDevelopmentProgress, desktop: newDevelopmentProgress },
          ];
          
          const newHistoricalExpenseBreakdown: ExpenseBreakdownDataPoint[] = [
            ...state.historicalExpenseBreakdown,
            {
              month: `M${newSimulationMonth}`,
              ...result.expenseBreakdown,
            },
          ];
          
          // Generate new missions if all current ones are completed
          const allMissionsCompleted = state.missions.every(m => m.isCompleted);
          const newMissions = allMissionsCompleted ? [
            {
              id: uuidv4(),
              title: `Month ${newSimulationMonth} Objective 1`,
              description: `Increase marketing spend by 10% to boost user acquisition.`,
              rewardText: "+5 Startup Score",
              isCompleted: false,
            },
            {
              id: uuidv4(),
              title: `Month ${newSimulationMonth} Objective 2`,
              description: `Improve product development progress by at least 10%.`,
              rewardText: "+5 Startup Score",
              isCompleted: false,
            },
            {
              id: uuidv4(),
              title: `Month ${newSimulationMonth} Objective 3`,
              description: `Maintain a positive cash flow for the month.`,
              rewardText: "+5 Startup Score",
              isCompleted: false,
            },
          ] : state.missions;
          
          // Update the state
          set({
            simulationMonth: newSimulationMonth,
            financials: {
              ...state.financials,
              revenue: newRevenue,
              expenses: newExpenses,
              profit: newProfit,
              burnRate: newBurnRate,
              cashOnHand: newCashOnHand,
            },
            userMetrics: {
              ...state.userMetrics,
              activeUsers: newActiveUsers,
              newUserAcquisitionRate: result.newUserAcquisition,
              monthlyRecurringRevenue: newActiveUsers * state.product.pricePerUser,
            },
            product: {
              ...state.product,
              stage: newProductStage,
              developmentProgress: newDevelopmentProgress,
            },
            startupScore: newStartupScore,
            keyEvents: newKeyEvents,
            rewards: newRewards,
            missions: newMissions,
            currentAiReasoning: result.aiReasoning || null,
            
            // Update historical data
            historicalRevenue: newHistoricalRevenue,
            historicalUserGrowth: newHistoricalUserGrowth,
            historicalBurnRate: newHistoricalBurnRate,
            historicalNetProfitLoss: newHistoricalNetProfitLoss,
            historicalCAC: newHistoricalCAC,
            historicalChurnRate: newHistoricalChurnRate,
            historicalProductProgress: newHistoricalProductProgress,
            historicalExpenseBreakdown: newHistoricalExpenseBreakdown,
          });
          
          // Randomly trigger surprise events (10% chance)
          if (Math.random() < 0.1 && !state.activeSurpriseEvent) {
            const eventTypes = ['angel_investor', 'dev_rage_quit', 'positive_pr', 'viral_moment'];
            const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as ActiveSurpriseEvent['type'];
            
            let eventTitle = '';
            let eventDescription = '';
            let acceptOption = { label: '', description: '' };
            let rejectOption = { label: '', description: '' };
            
            switch (randomType) {
              case 'angel_investor':
                eventTitle = 'Angel Investor Interest';
                eventDescription = `An angel investor is interested in your startup! They're offering ${state.financials.currencySymbol}${(state.financials.cashOnHand * 0.5).toLocaleString()} for 15% equity. This could provide a significant cash boost but dilutes your ownership.`;
                acceptOption = { 
                  label: 'Accept Investment', 
                  description: 'Take the money and give up 15% equity.' 
                };
                rejectOption = { 
                  label: 'Decline Offer', 
                  description: 'Maintain 100% ownership and continue bootstrapping.' 
                };
                break;
              case 'dev_rage_quit':
                eventTitle = 'Key Developer Crisis';
                eventDescription = 'Your lead developer is threatening to quit due to burnout! You can either give them a 20% raise or risk losing them and facing development delays.';
                acceptOption = { 
                  label: 'Offer Raise', 
                  description: 'Increase their salary by 20% to keep them.' 
                };
                rejectOption = { 
                  label: 'Let Them Go', 
                  description: 'Accept their departure and the potential development setback.' 
                };
                break;
              case 'positive_pr':
                eventTitle = 'Media Coverage Opportunity';
                eventDescription = 'A major tech publication wants to feature your startup! They need exclusive access and your time for interviews. This could boost visibility but will distract from development for a week.';
                acceptOption = { 
                  label: 'Pursue Coverage', 
                  description: 'Dedicate time to the media opportunity.' 
                };
                rejectOption = { 
                  label: 'Stay Focused', 
                  description: 'Decline and maintain focus on product development.' 
                };
                break;
              case 'viral_moment':
                eventTitle = 'Viral Social Media Moment';
                eventDescription = 'One of your product features has gone viral on social media! You can capitalize by quickly investing in marketing to ride the wave, or stay the course with your current strategy.';
                acceptOption = { 
                  label: 'Boost Marketing', 
                  description: 'Increase marketing spend to capitalize on the viral moment.' 
                };
                rejectOption = { 
                  label: 'Maintain Course', 
                  description: 'Stick to your original marketing plan.' 
                };
                break;
            }
            
            get().triggerSurpriseEvent({
              id: uuidv4(),
              type: randomType,
              title: eventTitle,
              description: eventDescription,
              monthTriggered: newSimulationMonth,
              options: {
                accept: acceptOption,
                reject: rejectOption,
              }
            });
          }
          
        } catch (error) {
          console.error("Error advancing month:", error);
          throw new Error(`Failed to advance month: ${error}`);
        }
      },
      
      resetSimulation: () => {
        set({
          ...initialDigitalTwinState,
          savedSimulations: get().savedSimulations, // Preserve saved simulations
        });
      },
      
      setMarketingSpend: (amount) => {
        set(state => ({
          resources: {
            ...state.resources,
            marketingSpend: amount,
          }
        }));
      },
      
      setRndSpend: (amount) => {
        set(state => ({
          resources: {
            ...state.resources,
            rndSpend: amount,
          }
        }));
      },
      
      setPricePerUser: (price) => {
        set(state => ({
          product: {
            ...state.product,
            pricePerUser: price,
          }
        }));
      },
      
      adjustTeamMemberCount: (role, delta, salary = 0) => {
        set(state => {
          const team = [...state.resources.team];
          const existingMemberIndex = team.findIndex(m => m.role === role);
          
          if (existingMemberIndex >= 0) {
            const existingMember = team[existingMemberIndex];
            const newCount = Math.max(0, existingMember.count + delta);
            
            if (newCount === 0) {
              // Remove the role if count becomes 0
              team.splice(existingMemberIndex, 1);
            } else {
              // Update the count
              team[existingMemberIndex] = {
                ...existingMember,
                count: newCount,
              };
            }
          } else if (delta > 0) {
            // Add new role if it doesn't exist and delta is positive
            team.push({
              role,
              count: delta,
              salary,
            });
          }
          
          return {
            resources: {
              ...state.resources,
              team,
            }
          };
        });
      },
      
      toggleMissionCompletion: (missionId) => {
        set(state => ({
          missions: state.missions.map(mission => 
            mission.id === missionId 
              ? { ...mission, isCompleted: !mission.isCompleted } 
              : mission
          )
        }));
      },
      
      setMissions: (missions) => {
        set(state => ({
          missions: missions.map(mission => ({
            ...mission,
            id: uuidv4(),
            isCompleted: false,
          }))
        }));
      },
      
      startSandboxExperiment: () => {
        const state = get();
        if (!state.isInitialized) return;
        
        // Create a deep copy of the current state for the sandbox
        const sandboxState: DigitalTwinState = JSON.parse(JSON.stringify({
          ...state,
          keyEvents: [], // Start with empty events in sandbox
          rewards: [],   // Start with empty rewards in sandbox
        }));
        
        set({
          sandboxState,
          isSandboxing: true,
          sandboxRelativeMonth: 0,
        });
      },
      
      discardSandboxExperiment: () => {
        set({
          sandboxState: null,
          isSandboxing: false,
          sandboxRelativeMonth: 0,
        });
      },
      
      simulateMonthInSandbox: async () => {
        const state = get();
        if (!state.isSandboxing || !state.sandboxState) return;
        
        try {
          // Prepare input for the AI simulation using sandbox state
          const input: SimulateMonthInput = {
            currentSimulationMonth: state.sandboxRelativeMonth,
            companyName: state.sandboxState.companyName,
            financials: {
              cashOnHand: state.sandboxState.financials.cashOnHand,
              currentRevenue: state.sandboxState.financials.revenue,
              currentExpenses: state.sandboxState.financials.expenses,
              currencyCode: state.sandboxState.financials.currencyCode,
              currencySymbol: state.sandboxState.financials.currencySymbol,
            },
            userMetrics: {
              activeUsers: state.sandboxState.userMetrics.activeUsers,
              churnRate: state.sandboxState.userMetrics.churnRate,
            },
            product: {
              stage: state.sandboxState.product.stage,
              developmentProgress: state.sandboxState.product.developmentProgress,
              pricePerUser: state.sandboxState.product.pricePerUser,
            },
            resources: {
              marketingSpend: state.sandboxState.resources.marketingSpend,
              rndSpend: state.sandboxState.resources.rndSpend,
              team: state.sandboxState.resources.team,
            },
            market: {
              competitionLevel: state.sandboxState.market.competitionLevel,
              targetMarketDescription: state.sandboxState.market.targetMarketDescription,
            },
            currentStartupScore: state.sandboxState.startupScore,
            activeScenarios: state.sandboxState.activeScenarios,
          };
          
          // Call the AI to simulate the month
          const result = await simulateMonth(input);
          
          // Process the AI output for sandbox
          const newSandboxRelativeMonth = state.sandboxRelativeMonth + 1;
          const newSandboxState = { ...state.sandboxState };
          
          // Update sandbox financials
          newSandboxState.financials.revenue = result.calculatedRevenue;
          newSandboxState.financials.expenses = result.calculatedExpenses;
          newSandboxState.financials.profit = result.profitOrLoss;
          newSandboxState.financials.burnRate = Math.max(0, -result.profitOrLoss);
          newSandboxState.financials.cashOnHand = result.updatedCashOnHand;
          
          // Update sandbox user metrics
          newSandboxState.userMetrics.activeUsers = result.updatedActiveUsers;
          newSandboxState.userMetrics.newUserAcquisitionRate = result.newUserAcquisition;
          newSandboxState.userMetrics.monthlyRecurringRevenue = result.updatedActiveUsers * newSandboxState.product.pricePerUser;
          
          // Update sandbox product
          if (result.newProductStage) {
            newSandboxState.product.stage = result.newProductStage;
            newSandboxState.product.developmentProgress = 0;
          } else {
            newSandboxState.product.developmentProgress += result.productDevelopmentDelta;
          }
          
          // Update sandbox key events
          newSandboxState.keyEvents = [
            ...newSandboxState.keyEvents,
            ...result.keyEventsGenerated.map(event => ({
              id: uuidv4(),
              timestamp: new Date().toISOString(),
              month: newSandboxRelativeMonth,
              description: event.description,
              category: event.category,
              impact: event.impact,
            })),
          ];
          
          // Update sandbox state
          set({
            sandboxState: newSandboxState,
            sandboxRelativeMonth: newSandboxRelativeMonth,
            currentAiReasoning: result.aiReasoning || null,
          });
          
        } catch (error) {
          console.error("Error simulating month in sandbox:", error);
          throw new Error(`Failed to simulate month in sandbox: ${error}`);
        }
      },
      
      applySandboxDecisionsToMain: () => {
        const state = get();
        if (!state.isSandboxing || !state.sandboxState) return;
        
        // Apply sandbox decision levers to main simulation
        set({
          resources: {
            ...state.resources,
            marketingSpend: state.sandboxState.resources.marketingSpend,
            rndSpend: state.sandboxState.resources.rndSpend,
            team: [...state.sandboxState.resources.team],
          },
          product: {
            ...state.product,
            pricePerUser: state.sandboxState.product.pricePerUser,
          },
          // Discard sandbox after applying decisions
          sandboxState: null,
          isSandboxing: false,
          sandboxRelativeMonth: 0,
        });
      },
      
      setSandboxMarketingSpend: (amount) => {
        set(state => {
          if (!state.isSandboxing || !state.sandboxState) return state;
          
          return {
            sandboxState: {
              ...state.sandboxState,
              resources: {
                ...state.sandboxState.resources,
                marketingSpend: amount,
              }
            }
          };
        });
      },
      
      setSandboxRndSpend: (amount) => {
        set(state => {
          if (!state.isSandboxing || !state.sandboxState) return state;
          
          return {
            sandboxState: {
              ...state.sandboxState,
              resources: {
                ...state.sandboxState.resources,
                rndSpend: amount,
              }
            }
          };
        });
      },
      
      setSandboxPricePerUser: (price) => {
        set(state => {
          if (!state.isSandboxing || !state.sandboxState) return state;
          
          return {
            sandboxState: {
              ...state.sandboxState,
              product: {
                ...state.sandboxState.product,
                pricePerUser: price,
              }
            }
          };
        });
      },
      
      adjustSandboxTeamMemberCount: (role, delta, salary = 0) => {
        set(state => {
          if (!state.isSandboxing || !state.sandboxState) return state;
          
          const team = [...state.sandboxState.resources.team];
          const existingMemberIndex = team.findIndex(m => m.role === role);
          
          if (existingMemberIndex >= 0) {
            const existingMember = team[existingMemberIndex];
            const newCount = Math.max(0, existingMember.count + delta);
            
            if (newCount === 0) {
              // Remove the role if count becomes 0
              team.splice(existingMemberIndex, 1);
            } else {
              // Update the count
              team[existingMemberIndex] = {
                ...existingMember,
                count: newCount,
              };
            }
          } else if (delta > 0) {
            // Add new role if it doesn't exist and delta is positive
            team.push({
              role,
              count: delta,
              salary,
            });
          }
          
          return {
            sandboxState: {
              ...state.sandboxState,
              resources: {
                ...state.sandboxState.resources,
                team,
              }
            }
          };
        });
      },
      
      saveCurrentSimulation: (name) => {
        const state = get();
        if (!state.isInitialized) return null;
        
        const snapshot: SimulationSnapshot = {
          id: uuidv4(),
          name,
          createdAt: new Date().toISOString(),
          simulationState: { ...state },
        };
        
        set(state => ({
          savedSimulations: [...state.savedSimulations, snapshot],
        }));
        
        return snapshot;
      },
      
      loadSimulation: (snapshotId) => {
        const state = get();
        const snapshot = state.savedSimulations.find(s => s.id === snapshotId);
        
        if (!snapshot) return null;
        
        // Load the saved state
        set({
          ...snapshot.simulationState,
          savedSimulations: state.savedSimulations, // Preserve saved simulations
          sandboxState: null, // Reset sandbox
          isSandboxing: false,
          sandboxRelativeMonth: 0,
        });
        
        return snapshot.simulationState;
      },
      
      deleteSavedSimulation: (snapshotId) => {
        set(state => ({
          savedSimulations: state.savedSimulations.filter(s => s.id !== snapshotId),
        }));
      },
      
      addScenario: (scenario) => {
        set(state => {
          if (state.activeScenarios.includes(scenario)) return state;
          
          return {
            activeScenarios: [...state.activeScenarios, scenario],
            keyEvents: [
              ...state.keyEvents,
              {
                id: uuidv4(),
                timestamp: new Date().toISOString(),
                month: state.simulationMonth,
                description: `Implemented new scenario: ${scenario}`,
                category: 'System',
                impact: 'Neutral',
              }
            ]
          };
        });
      },
      
      removeScenario: (scenario) => {
        set(state => ({
          activeScenarios: state.activeScenarios.filter(s => s !== scenario),
          keyEvents: [
            ...state.keyEvents,
            {
              id: uuidv4(),
              timestamp: new Date().toISOString(),
              month: state.simulationMonth,
              description: `Removed scenario: ${scenario}`,
              category: 'System',
              impact: 'Neutral',
            }
          ]
        }));
      },
      
      triggerSurpriseEvent: (event) => {
        set({
          activeSurpriseEvent: event,
        });
      },
      
      resolveSurpriseEvent: (outcome) => {
        const state = get();
        if (!state.activeSurpriseEvent) return;
        
        // Record the event in history
        const historyItem: SurpriseEventHistoryItem = {
          eventId: state.activeSurpriseEvent.id,
          eventType: state.activeSurpriseEvent.type,
          monthOccurred: state.activeSurpriseEvent.monthTriggered,
          outcome,
          timestamp: new Date().toISOString(),
        };
        
        // Apply effects based on the outcome
        if (outcome === 'accepted') {
          switch (state.activeSurpriseEvent.type) {
            case 'angel_investor':
              // Add funding, record dilution
              set(state => ({
                financials: {
                  ...state.financials,
                  cashOnHand: state.financials.cashOnHand + (state.financials.cashOnHand * 0.5),
                  fundingRaised: state.financials.fundingRaised + (state.financials.cashOnHand * 0.5),
                },
                keyEvents: [
                  ...state.keyEvents,
                  {
                    id: uuidv4(),
                    timestamp: new Date().toISOString(),
                    month: state.simulationMonth,
                    description: `Accepted angel investment: ${state.financials.currencySymbol}${(state.financials.cashOnHand * 0.5).toLocaleString()} for 15% equity.`,
                    category: 'Financial',
                    impact: 'Positive',
                  }
                ]
              }));
              break;
            case 'dev_rage_quit':
              // Increase salary for developer
              set(state => {
                const team = [...state.resources.team];
                const devIndex = team.findIndex(m => m.role.toLowerCase().includes('engineer') || m.role.toLowerCase().includes('developer'));
                
                if (devIndex >= 0) {
                  team[devIndex] = {
                    ...team[devIndex],
                    salary: team[devIndex].salary * 1.2, // 20% raise
                  };
                }
                
                return {
                  resources: {
                    ...state.resources,
                    team,
                  },
                  keyEvents: [
                    ...state.keyEvents,
                    {
                      id: uuidv4(),
                      timestamp: new Date().toISOString(),
                      month: state.simulationMonth,
                      description: `Gave key developer a 20% raise to prevent burnout and retain talent.`,
                      category: 'Team',
                      impact: 'Positive',
                    }
                  ]
                };
              });
              break;
            case 'positive_pr':
              // Boost user acquisition but slow development
              set(state => ({
                userMetrics: {
                  ...state.userMetrics,
                  customerAcquisitionCost: state.userMetrics.customerAcquisitionCost * 0.8, // 20% reduction in CAC
                },
                product: {
                  ...state.product,
                  developmentProgress: Math.max(0, state.product.developmentProgress - 5), // Small development setback
                },
                keyEvents: [
                  ...state.keyEvents,
                  {
                    id: uuidv4(),
                    timestamp: new Date().toISOString(),
                    month: state.simulationMonth,
                    description: `Featured in major tech publication, boosting visibility but temporarily slowing development.`,
                    category: 'Market',
                    impact: 'Positive',
                  }
                ]
              }));
              break;
            case 'viral_moment':
              // Boost marketing effectiveness
              set(state => ({
                resources: {
                  ...state.resources,
                  marketingSpend: state.resources.marketingSpend * 1.5, // 50% increase in marketing spend
                },
                userMetrics: {
                  ...state.userMetrics,
                  customerAcquisitionCost: state.userMetrics.customerAcquisitionCost * 0.7, // 30% reduction in CAC
                },
                keyEvents: [
                  ...state.keyEvents,
                  {
                    id: uuidv4(),
                    timestamp: new Date().toISOString(),
                    month: state.simulationMonth,
                    description: `Capitalized on viral social media moment with increased marketing spend.`,
                    category: 'Market',
                    impact: 'Positive',
                  }
                ]
              }));
              break;
          }
        } else {
          // Handle rejection outcomes
          switch (state.activeSurpriseEvent.type) {
            case 'angel_investor':
              set(state => ({
                keyEvents: [
                  ...state.keyEvents,
                  {
                    id: uuidv4(),
                    timestamp: new Date().toISOString(),
                    month: state.simulationMonth,
                    description: `Declined angel investment offer to maintain full ownership.`,
                    category: 'Financial',
                    impact: 'Neutral',
                  }
                ]
              }));
              break;
            case 'dev_rage_quit':
              // Developer leaves, development slows
              set(state => {
                const team = [...state.resources.team];
                const devIndex = team.findIndex(m => m.role.toLowerCase().includes('engineer') || m.role.toLowerCase().includes('developer'));
                
                if (devIndex >= 0 && team[devIndex].count > 0) {
                  team[devIndex] = {
                    ...team[devIndex],
                    count: team[devIndex].count - 1,
                  };
                  
                  if (team[devIndex].count === 0) {
                    team.splice(devIndex, 1);
                  }
                }
                
                return {
                  resources: {
                    ...state.resources,
                    team,
                  },
                  product: {
                    ...state.product,
                    developmentProgress: Math.max(0, state.product.developmentProgress - 15), // Significant development setback
                  },
                  keyEvents: [
                    ...state.keyEvents,
                    {
                      id: uuidv4(),
                      timestamp: new Date().toISOString(),
                      month: state.simulationMonth,
                      description: `Key developer left the team due to burnout, causing development delays.`,
                      category: 'Team',
                      impact: 'Negative',
                    }
                  ]
                };
              });
              break;
            case 'positive_pr':
              set(state => ({
                keyEvents: [
                  ...state.keyEvents,
                  {
                    id: uuidv4(),
                    timestamp: new Date().toISOString(),
                    month: state.simulationMonth,
                    description: `Declined media coverage opportunity to maintain focus on development.`,
                    category: 'Market',
                    impact: 'Neutral',
                  }
                ]
              }));
              break;
            case 'viral_moment':
              set(state => ({
                keyEvents: [
                  ...state.keyEvents,
                  {
                    id: uuidv4(),
                    timestamp: new Date().toISOString(),
                    month: state.simulationMonth,
                    description: `Chose not to capitalize on viral moment, maintaining original marketing strategy.`,
                    category: 'Market',
                    impact: 'Neutral',
                  }
                ]
              }));
              break;
          }
        }
        
        // Clear the active event and update history
        set(state => ({
          activeSurpriseEvent: null,
          surpriseEventHistory: [...state.surpriseEventHistory, historyItem],
        }));
      },
      
      awardQuestBadge: (name, description, questId, iconName) => {
        set(state => ({
          earnedBadges: [
            ...state.earnedBadges,
            {
              questId,
              name,
              description,
              icon: iconName,
              dateEarned: new Date().toISOString(),
            }
          ],
          rewards: [
            ...state.rewards,
            {
              id: uuidv4(),
              name: `Badge: ${name}`,
              description: `Earned the "${name}" badge: ${description}`,
              dateEarned: new Date().toISOString(),
            }
          ],
          keyEvents: [
            ...state.keyEvents,
            {
              id: uuidv4(),
              timestamp: new Date().toISOString(),
              month: state.simulationMonth,
              description: `Earned the "${name}" badge for completing a quest!`,
              category: 'System',
              impact: 'Positive',
            }
          ]
        }));
      },
    }),
    {
      name: 'inceptico-simulation-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // Exclude certain fields from persistence
        const {
          activeSurpriseEvent,
          currentAiReasoning,
          ...persistedState
        } = state;
        return persistedState;
      },
    }
  )
);
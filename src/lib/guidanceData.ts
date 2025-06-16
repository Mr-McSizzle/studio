
// src/lib/guidanceData.ts
import type { GuidanceStep, QuestCompletionReward } from '@/types/guidance';

// Define your guidance steps here.
const ONBOARDING_QUEST_ID = "onboarding_basics";

export const predefinedGuidanceSteps: GuidanceStep[] = [
  {
    id: "dashboard-welcome-tip",
    message: "Welcome to your Dashboard! This is your startup's command center. Monitor key metrics like Cash, Users, and your Startup Score here.",
    trigger: { type: "pageOpen", path: "/app/dashboard", delayMs: 700 },
    highlightSelector: ".container h1", // Example: Targets the main h1 on the dashboard
    targetElementAttachment: "bottom-start",
    once: true,
    xpValue: 2,
    // Quest Info
    questId: ONBOARDING_QUEST_ID,
    questTitle: "ForgeSim Onboarding",
    isQuestStart: true,
    nextStepId: "setup-page-intro-quest", // Link to the next step in the quest
    questTotalSteps: 4,
    currentStepNumber: 1,
  },
  {
    id: "setup-page-intro-quest",
    message: "Let's define your venture! Fill out these details to create your initial business simulation. This is crucial for tailoring ForgeSim to your vision.",
    trigger: { type: "pageOpen", path: "/app/setup", delayMs: 500 },
    highlightSelector: "header h1", // Example: Targets the h1 in the setup page header
    targetElementAttachment: "bottom-start",
    once: true, // Individual step 'once' logic
    xpValue: 1,
    // Quest Info
    questId: ONBOARDING_QUEST_ID,
    questTitle: "ForgeSim Onboarding",
    previousStepId: "dashboard-welcome-tip",
    nextStepId: "mentor-chat-intro-quest",
    questTotalSteps: 4,
    currentStepNumber: 2,
  },
  {
    id: "mentor-chat-intro-quest",
    message: "Meet EVE, your AI Hive Mind assistant. She's your primary contact for strategic advice and can tap into a team of specialized AI agents. Ask her anything!",
    trigger: { type: "pageOpen", path: "/app/mentor", delayMs: 600 },
    highlightSelector: ".flex.flex-col.h-\\\\[calc\\\\(100vh-20rem\\\\)\\\\]", // Chat interface container
    targetElementAttachment: "top-center",
    once: true,
    xpValue: 2,
    // Quest Info
    questId: ONBOARDING_QUEST_ID,
    questTitle: "ForgeSim Onboarding",
    previousStepId: "setup-page-intro-quest",
    nextStepId: "decision-controls-overview-quest",
    questTotalSteps: 4,
    currentStepNumber: 3,
  },
  {
    id: "decision-controls-overview-quest",
    message: "Here in 'Decision Controls,' you can adjust your monthly spending on marketing, R&D, and set your product price. These changes will affect your simulation's next month.",
    trigger: { type: "pageOpen", path: "/app/simulation", delayMs: 600 },
    highlightSelector: ".lg\\:col-span-1 .shadow-lg", // Targets the 'Monthly Adjustments' card
    targetElementAttachment: "left-start",
    once: true,
    xpValue: 1,
    // Quest Info
    questId: ONBOARDING_QUEST_ID,
    questTitle: "ForgeSim Onboarding",
    isQuestEnd: true, // This is the last step of this quest
    previousStepId: "mentor-chat-intro-quest",
    questTotalSteps: 4,
    currentStepNumber: 4,
  },
  {
    id: "strategy-page-generate-button", // Standalone tip, not part of onboarding quest
    message: "Get AI-powered strategic insights by clicking the 'Generate' button. It analyzes your current simulation state to provide recommendations.",
    trigger: { type: "pageOpen", path: "/app/strategy", delayMs: 600 },
    highlightSelector: ".bg-accent.hover\\:bg-accent\\/90", // Targets the "Generate AI Strategic Insights" button
    targetElementAttachment: "bottom-center",
    once: true,
    xpValue: 1,
  }
];

export const questCompletionRewardsData: QuestCompletionReward[] = [
  {
    questId: ONBOARDING_QUEST_ID,
    xp: 25, // Significant XP for completing the onboarding quest
    badgeName: "ForgeSim Navigator",
    badgeDescription: "Successfully completed the initial onboarding tour of ForgeSim.",
    badgeIcon: "Compass", // Example Lucide icon name
  },
  // Add more quest rewards here as you define more quests
];

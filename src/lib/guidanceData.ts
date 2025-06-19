
// src/lib/guidanceData.ts
import type { GuidanceStep, QuestCompletionReward } from '@/types/guidance';

// Define your guidance steps here.
const ONBOARDING_QUEST_ID = "onboarding_basics";
const DISCOVERY_BADGE_QUEST_ID = "general_discoveries"; // A conceptual quest ID for discovery badges
const COMMUNITY_CONTRIBUTOR_QUEST_ID = "community_contributor_wisdom"; // Placeholder for user-submitted tip rewards

export const predefinedGuidanceSteps: GuidanceStep[] = [
  // --- Onboarding Quest ---
  {
    id: "dashboard-welcome-tip",
    message: "Welcome to your Dashboard! This is your startup's command center. Monitor key metrics like Cash, Users, and your Startup Score here.",
    trigger: { type: "pageOpen", path: "/app/dashboard", delayMs: 700 },
    highlightSelector: ".container .text-3xl.font-headline",
    targetElementAttachment: "bottom-start",
    once: true,
    xpValue: 2,
    questId: ONBOARDING_QUEST_ID,
    questTitle: "Inceptico Onboarding",
    isQuestStart: true,
    nextStepId: "setup-page-intro-quest",
    questTotalSteps: 4,
    currentStepNumber: 1,
    suggestedAction: {
      label: "Learn About Dashboards (External)",
      path: "https://en.wikipedia.org/wiki/Dashboard_(business)"
    },
    isDailyInsight: true,
  },
  {
    id: "setup-page-intro-quest",
    message: "Let's define your venture! Fill out these details to create your initial business simulation. This is crucial for tailoring Inceptico to your vision.",
    trigger: { type: "pageOpen", path: "/app/setup", delayMs: 500 },
    highlightSelector: "header h1",
    targetElementAttachment: "bottom-start",
    once: true,
    xpValue: 1,
    questId: ONBOARDING_QUEST_ID,
    questTitle: "Inceptico Onboarding",
    previousStepId: "dashboard-welcome-tip",
    nextStepId: "mentor-chat-intro-quest",
    questTotalSteps: 4,
    currentStepNumber: 2,
  },
  {
    id: "mentor-chat-intro-quest",
    message: "Meet EVE, your AI Hive Mind assistant. She's your primary contact for strategic advice and can tap into a team of specialized AI agents. Ask her anything!",
    trigger: { type: "pageOpen", path: "/app/mentor", delayMs: 600 },
    highlightSelector: "[data-guidance-target='chat-container']", // Changed selector
    targetElementAttachment: "top-center",
    once: true,
    xpValue: 2,
    questId: ONBOARDING_QUEST_ID,
    questTitle: "Inceptico Onboarding",
    previousStepId: "setup-page-intro-quest",
    nextStepId: "decision-controls-overview-quest",
    questTotalSteps: 4,
    currentStepNumber: 3,
    suggestedAction: {
      label: "Ask EVE for Startup Name Ideas",
      path: "/app/mentor"
    }
  },
  {
    id: "decision-controls-overview-quest",
    message: "Here in 'Decision Controls,' you can adjust your monthly spending on marketing, R&D, and set your product price. These changes will affect your simulation's next month.",
    trigger: { type: "pageOpen", path: "/app/simulation", delayMs: 600 },
    highlightSelector: ".lg\\:col-span-1 .shadow-lg",
    targetElementAttachment: "left-start",
    once: true,
    xpValue: 1,
    questId: ONBOARDING_QUEST_ID,
    questTitle: "Inceptico Onboarding",
    isQuestEnd: true,
    previousStepId: "mentor-chat-intro-quest",
    questTotalSteps: 4,
    currentStepNumber: 4,
  },
  // --- Standalone/Discovery Tips ---
  {
    id: "strategy-page-generate-button",
    message: "Get AI-powered strategic insights by clicking the 'Generate' button. It analyzes your current simulation state to provide recommendations.",
    trigger: { type: "pageOpen", path: "/app/strategy", delayMs: 600 },
    highlightSelector: ".bg-accent.hover\\:bg-accent\\/90",
    targetElementAttachment: "bottom-center",
    once: true,
    xpValue: 1,
    suggestedAction: {
      label: "Generate Insights Now",
      path: "/app/strategy"
    },
    isDailyInsight: true,
  },
  {
    id: "lab-discovery-tip",
    message: "The Innovation Lab is your sandbox for bold ideas! Test scenarios or new decision levers here without impacting your main simulation. Great for risk-free experimentation.",
    trigger: { type: "pageOpen", path: "/app/lab", delayMs: 800 },
    highlightSelector: "#sandbox-section",
    targetElementAttachment: "top-center",
    once: true,
    isDiscovery: true,
    discoveryXpValue: 10,
    xpValue: 0, // xpValue is overridden by discoveryXpValue if isDiscovery is true
    suggestedAction: {
        label: "Start a Sandbox Experiment",
        path: "/app/lab"
    }
  },
  {
    id: "first-time-todo-tip",
    message: "Welcome to your Quest Log! This is where you can track strategic tasks. Completing tasks earns you XP. Try adding your first one!",
    trigger: { type: "pageOpen", path: "/app/todo", delayMs: 500 },
    highlightSelector: "form > div:first-child",
    targetElementAttachment: "bottom-start",
    once: true,
    xpValue: 2,
  }
];

export const questCompletionRewardsData: QuestCompletionReward[] = [
  {
    questId: ONBOARDING_QUEST_ID,
    xp: 25,
    badgeName: "Inceptico Navigator",
    badgeDescription: "Successfully completed the initial onboarding tour of Inceptico.",
    badgeIcon: "Compass",
    unlocksCosmeticId: "tip_theme_founders_choice", // Unlock a theme on completing onboarding
  },
  {
    questId: DISCOVERY_BADGE_QUEST_ID,
    xp: 50,
    badgeName: "Sage of Inceptico",
    badgeDescription: "Unlocked deep insights and discovered hidden wisdom within the simulation.",
    badgeIcon: "Scroll",
  },
  { // Placeholder for Community Contributor badge
    questId: COMMUNITY_CONTRIBUTOR_QUEST_ID,
    xp: 100, // Example significant XP
    badgeName: "Community Sage",
    badgeDescription: "Your wisdom has been recognized and shared with fellow founders!",
    badgeIcon: "Award",
    unlocksCosmeticId: "tip_theme_community_glow", // Example future cosmetic
  }
];



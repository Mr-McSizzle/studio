
// src/lib/guidanceData.ts
import type { GuidanceStep, QuestCompletionReward } from '@/types/guidance';

// Define your guidance steps here.
const ONBOARDING_QUEST_ID = "onboarding_basics";
const DISCOVERY_BADGE_QUEST_ID = "general_discoveries"; // A conceptual quest ID for discovery badges

export const predefinedGuidanceSteps: GuidanceStep[] = [
  // --- Onboarding Quest ---
  {
    id: "dashboard-welcome-tip",
    message: "Welcome to your Dashboard! This is your startup's command center. Monitor key metrics like Cash, Users, and your Startup Score here.",
    trigger: { type: "pageOpen", path: "/app/dashboard", delayMs: 700 },
    highlightSelector: ".container h1", 
    targetElementAttachment: "bottom-start",
    once: true,
    xpValue: 2,
    questId: ONBOARDING_QUEST_ID,
    questTitle: "ForgeSim Onboarding",
    isQuestStart: true,
    nextStepId: "setup-page-intro-quest", 
    questTotalSteps: 4,
    currentStepNumber: 1,
  },
  {
    id: "setup-page-intro-quest",
    message: "Let's define your venture! Fill out these details to create your initial business simulation. This is crucial for tailoring ForgeSim to your vision.",
    trigger: { type: "pageOpen", path: "/app/setup", delayMs: 500 },
    highlightSelector: "header h1", 
    targetElementAttachment: "bottom-start",
    once: true, 
    xpValue: 1,
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
    highlightSelector: ".flex.flex-col.h-\\\\[calc\\\\(100vh-20rem\\\\)\\\\]", 
    targetElementAttachment: "top-center",
    once: true,
    xpValue: 2,
    questId: ONBOARDING_QUEST_ID,
    questTitle: "ForgeSim Onboarding",
    previousStepId: "setup-page-intro-quest",
    nextStepId: "decision-controls-overview-quest",
    questTotalSteps: 4,
    currentStepNumber: 3,
    suggestedAction: {
      label: "Ask EVE a question",
      path: "/app/mentor" // Stays on the same page, user expected to interact
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
    questTitle: "ForgeSim Onboarding",
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
      path: "/app/strategy" // stays on page, user clicks button
    }
  },
  {
    id: "lab-discovery-tip",
    message: "Sage's Wisdom: The Innovation Lab is your sandbox for bold ideas! Test scenarios or new decision levers here without impacting your main simulation. Great for risk-free experimentation.",
    trigger: { type: "pageOpen", path: "/app/lab", delayMs: 800 },
    highlightSelector: "#sandbox-section", // Assuming a section for sandbox controls
    targetElementAttachment: "top-center",
    once: true,
    isDiscovery: true,
    discoveryXpValue: 10, // Higher XP for discovery
    xpValue: 0, // Standard XP not applicable if discovery XP is given
    suggestedAction: {
        label: "Start a Sandbox Experiment",
        path: "/app/lab" // User needs to click the button on the page
    }
  },
  {
    id: "first-time-todo-tip",
    message: "Welcome to your Quest Log! This is where you can track strategic tasks. Completing tasks earns you XP. Try adding your first one!",
    trigger: { type: "pageOpen", path: "/app/todo", delayMs: 500 },
    highlightSelector: "form > div:first-child", // Highlights the task description input
    targetElementAttachment: "bottom-start",
    once: true,
    xpValue: 2,
  }
];

export const questCompletionRewardsData: QuestCompletionReward[] = [
  {
    questId: ONBOARDING_QUEST_ID,
    xp: 25, 
    badgeName: "ForgeSim Navigator",
    badgeDescription: "Successfully completed the initial onboarding tour of ForgeSim.",
    badgeIcon: "Compass", 
  },
  {
    questId: DISCOVERY_BADGE_QUEST_ID, // Conceptual - if we want a specific badge for N discoveries
    xp: 50,
    badgeName: "Sage of ForgeSim",
    badgeDescription: "Unlocked deep insights and discovered hidden wisdom within the simulation.",
    badgeIcon: "Scroll",
  }
];


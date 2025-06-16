// src/lib/guidanceData.ts
import type { GuidanceStep } from '@/types/guidance';

// Define your guidance steps here.
// These were previously intended for Firestore.

export const predefinedGuidanceSteps: GuidanceStep[] = [
  {
    id: "dashboard-welcome-tip",
    message: "Welcome to your Dashboard! This is your startup's command center. Monitor key metrics like Cash, Users, and your Startup Score here.",
    trigger: { type: "pageOpen", path: "/app/dashboard", delayMs: 700 },
    highlightSelector: ".container h1", // Example: Targets the main h1 on the dashboard
    targetElementAttachment: "bottom-start",
    once: true
  },
  {
    id: "setup-page-intro",
    message: "Ready to define your venture? Fill out these details to create your initial business simulation!",
    trigger: { type: "pageOpen", path: "/app/setup", delayMs: 500 },
    highlightSelector: "header h1", // Example: Targets the h1 in the setup page header
    targetElementAttachment: "bottom-start",
    once: true
  },
  {
    id: "mentor-chat-intro",
    message: "This is EVE, your AI Hive Mind assistant. Ask her anything about your simulation or business strategy!",
    trigger: { type: "pageOpen", path: "/app/mentor", delayMs: 600 },
    highlightSelector: ".flex.flex-col.h-\[calc\(100vh-20rem\)\]", // Example: Targets the main chat interface container
    targetElementAttachment: "top-center",
    once: true
  },
  {
    id: "decision-controls-overview",
    message: "Adjust your monthly spending on marketing, R&D, and set your product price here. Changes apply next month!",
    trigger: { type: "pageOpen", path: "/app/simulation", delayMs: 600 },
    highlightSelector: ".lg\\:col-span-1 .shadow-lg", // Targets the 'Monthly Adjustments' card
    targetElementAttachment: "left-start",
    once: true
  },
  {
    id: "strategy-page-generate-button",
    message: "Get AI-powered strategic insights by clicking this button. It analyzes your current simulation state.",
    trigger: { type: "pageOpen", path: "/app/strategy", delayMs: 600 },
    highlightSelector: ".bg-accent.hover\\:bg-accent\\/90", // Targets the "Generate AI Strategic Insights" button
    targetElementAttachment: "bottom-center",
    once: true
  }
  // Add more steps for other pages and triggers as needed.
  // For example:
  // {
  //   id: "first-mission-generated",
  //   message: "New missions are available! Check them out on the 'Milestones & Score' page.",
  //   trigger: { type: "simulationState", condition: "newMissionsAvailable" }, // This trigger type needs more logic
  //   highlightSelector: "a[href='/app/gamification']",
  //   targetElementAttachment: "right-center",
  //   once: true
  // }
];

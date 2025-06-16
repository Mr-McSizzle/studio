
// src/types/guidance.ts

export type GuidanceTriggerType =
  | 'pageOpen'
  | 'elementVisible' // Future: requires IntersectionObserver
  | 'elementClick'   // Future: requires event delegation or component signals
  | 'simulationState'// Future: requires deeper sim store integration
  | 'idle';          // Future: requires activity tracking

export interface BaseGuidanceTrigger {
  type: GuidanceTriggerType;
  delayMs?: number; // Optional delay before showing the guide
}

export interface PageOpenTrigger extends BaseGuidanceTrigger {
  type: 'pageOpen';
  path: string; // Can be an exact path or a regex pattern string later
}

// Add other trigger types as needed, e.g.:
// export interface ElementVisibleTrigger extends BaseGuidanceTrigger {
//   type: 'elementVisible';
//   selector: string;
// }

export type GuidanceTrigger = PageOpenTrigger; // Union of all trigger types

export interface SuggestedAction {
  label: string; // Text for the button
  path: string;  // Path to navigate to or external URL
  // Future: actionType: 'navigate' | 'dispatchStoreAction' | 'openModal', target?: string (e.g. modalId or store action type)
}

export interface GuidanceStep {
  id: string; // Unique identifier for this step
  message: string; // The guidance message to display
  trigger: GuidanceTrigger; // The condition that activates this guide
  highlightSelector?: string; // Optional CSS selector for an element to highlight
  targetElementAttachment?: AttachmentPoint; // How to attach the tip to the highlighted element
  once?: boolean; // If true, show this guide only once per user (tracked in localStorage for display)
  xpValue?: number; // Optional XP awarded for acknowledging this tip (awarded only once)
  
  // Quest-related fields
  questId?: string; // Identifier for the quest this step belongs to
  questTitle?: string; // Display title for the quest
  isQuestStart?: boolean; // True if this is the first step of a quest
  isQuestEnd?: boolean; // True if this is the last step of a quest
  nextStepId?: string; // ID of the next step in the quest sequence
  previousStepId?: string; // ID of the previous step in the quest sequence
  questTotalSteps?: number; // Total number of steps in this quest (for display)
  currentStepNumber?: number; // The number of this step within its quest (for display)

  // Discovery Mechanic fields
  isDiscovery?: boolean; // If true, this is a "hidden wisdom" tip
  discoveryXpValue?: number; // Bonus XP for discovering this tip

  // Actionable Tip fields
  suggestedAction?: SuggestedAction; // Optional action button in the tip

  // Daily Insight field
  isDailyInsight?: boolean; // If true, this tip can be part of the "Tip of the Day" system
}

export interface QuestCompletionReward {
  questId: string;
  xp: number;
  badgeName: string;
  badgeDescription: string;
  badgeIcon?: string; // Optional: Lucide icon name or path to an SVG
  unlocksCosmeticId?: string; // Optional: ID of a cosmetic item unlocked by this quest
}


export type AttachmentPoint =
  | 'top-start' | 'top-center' | 'top-end'
  | 'right-start' | 'right-center' | 'right-end'
  | 'bottom-start' | 'bottom-center' | 'bottom-end'
  | 'left-start' | 'left-center' | 'left-end'
  | 'center'; // Fallback if no target element

// This type is not used as we are not using Firestore anymore for guidance steps.
// export interface FirestoreGuidanceDocument {
// steps: GuidanceStep[];
// }

// Conceptual type for User-Suggested Tips (Future Feature)
/*
export interface SubmittedTip {
  id: string;                 // Auto-generated
  userId: string;             // ID of the submitting user
  tipContent: string;         // The actual text of the tip
  suggestedContextPage?: string; // e.g., "/app/dashboard"
  suggestedContextElement?: string; // e.g., "#cashOnHandCard" (CSS selector)
  suggestedTrigger?: GuidanceTriggerType; // Optional: 'pageOpen', 'elementVisible', etc.
  tags?: string[];            // User-suggested tags
  submissionDate: string;     // ISO Date string
  status: 'pending' | 'approved' | 'rejected' | 'needs_edit'; // Moderation status
  moderatorFeedback?: string; // Feedback from moderator if rejected or needs edit
  upvotes: number;            // Community upvotes
  // downvotes: number;       // Optional: Community downvotes
  // version?: number;        // For tracking edits if allowed
}
*/

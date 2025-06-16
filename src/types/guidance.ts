
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

export interface GuidanceStep {
  id: string; // Unique identifier for this step
  message: string; // The guidance message to display
  trigger: GuidanceTrigger; // The condition that activates this guide
  highlightSelector?: string; // Optional CSS selector for an element to highlight
  targetElementAttachment?: AttachmentPoint; // How to attach the tip to the highlighted element
  once?: boolean; // If true, show this guide only once per user (tracked in localStorage for display)
  xpValue?: number; // Optional XP awarded for acknowledging this tip (awarded only once)
  dependsOn?: string[]; // Optional: IDs of other steps that must be completed first
  priority?: number; // Optional: for resolving multiple triggered guides
}

export type AttachmentPoint =
  | 'top-start' | 'top-center' | 'top-end'
  | 'right-start' | 'right-center' | 'right-end'
  | 'bottom-start' | 'bottom-center' | 'bottom-end'
  | 'left-start' | 'left-center' | 'left-end'
  | 'center'; // Fallback if no target element

export interface FirestoreGuidanceDocument {
  steps: GuidanceStep[];
}

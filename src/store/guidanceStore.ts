
// src/store/guidanceStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GuidanceStep } from '@/types/guidance';
import { predefinedGuidanceSteps } from '@/lib/guidanceData';

const LOCALSTORAGE_SHOWN_STEPS_KEY = 'forgeSimShownGuidanceSteps';
const LOCALSTORAGE_AWARDED_XP_STEPS_KEY = 'forgeSimAwardedXpSteps'; // New key for awarded XP

interface GuidanceState {
  steps: GuidanceStep[];
  shownSteps: string[]; // Array of step IDs that have been shown (for display `once` logic)
  awardedXpForSteps: string[]; // Array of step IDs for which XP has been awarded
  insightXp: number; // Total XP earned from acknowledging guidance tips
  activeGuidance: GuidanceStep | null;
  activeTargetSelector: string | null;
  activeTargetAttachment: GuidanceStep['targetElementAttachment'];

  loadGuidanceSteps: () => void;
  markStepAsShown: (stepId: string) => void;
  setActiveGuidance: (step: GuidanceStep | null) => void;
  clearActiveGuidance: () => void; // This will now also handle XP awarding
  _loadPersistedData: () => void;
  _persistShownSteps: () => void;
  _persistAwardedXpSteps: () => void;
}

export const useGuidanceStore = create<GuidanceState>()(
  persist(
    (set, get) => ({
      steps: [],
      shownSteps: [],
      awardedXpForSteps: [],
      insightXp: 0,
      activeGuidance: null,
      activeTargetSelector: null,
      activeTargetAttachment: undefined,

      loadGuidanceSteps: () => {
        set({ steps: predefinedGuidanceSteps });
      },

      markStepAsShown: (stepId: string) => {
        set((state) => {
          if (!state.shownSteps.includes(stepId)) {
            return { shownSteps: [...state.shownSteps, stepId] };
          }
          return state;
        });
        get()._persistShownSteps();
      },

      setActiveGuidance: (step: GuidanceStep | null) => {
        set({
          activeGuidance: step,
          activeTargetSelector: step?.highlightSelector || null,
          activeTargetAttachment: step?.targetElementAttachment || 'center',
        });
      },

      clearActiveGuidance: () => {
        const currentActiveGuidance = get().activeGuidance;
        if (currentActiveGuidance) {
          get().markStepAsShown(currentActiveGuidance.id); // Mark as shown for display 'once' logic

          // Award XP if applicable and not already awarded
          if (
            currentActiveGuidance.xpValue &&
            currentActiveGuidance.xpValue > 0 &&
            !get().awardedXpForSteps.includes(currentActiveGuidance.id)
          ) {
            set(state => ({
              insightXp: state.insightXp + (currentActiveGuidance.xpValue || 0),
              awardedXpForSteps: [...state.awardedXpForSteps, currentActiveGuidance.id],
            }));
            get()._persistAwardedXpSteps(); // Persist awarded XP steps
            // The visual XP animation will be handled by the ContextualGuidanceTip component
          }
        }
        set({ activeGuidance: null, activeTargetSelector: null, activeTargetAttachment: undefined });
      },

      _loadPersistedData: () => {
        if (typeof window !== 'undefined') {
          const storedShown = localStorage.getItem(LOCALSTORAGE_SHOWN_STEPS_KEY);
          if (storedShown) {
            try {
              const parsed = JSON.parse(storedShown);
              if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                set({ shownSteps: parsed });
              }
            } catch (e) { console.error("Failed to parse shown guidance steps", e); }
          }

          const storedAwardedXp = localStorage.getItem(LOCALSTORAGE_AWARDED_XP_STEPS_KEY);
          if (storedAwardedXp) {
            try {
              const parsed = JSON.parse(storedAwardedXp);
              if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                set({ awardedXpForSteps: parsed });
              }
            } catch (e) { console.error("Failed to parse awarded XP steps", e); }
          }
          // insightXp is persisted directly by the middleware
        }
      },
      _persistShownSteps: () => {
         if (typeof window !== 'undefined') {
            localStorage.setItem(LOCALSTORAGE_SHOWN_STEPS_KEY, JSON.stringify(get().shownSteps));
         }
      },
      _persistAwardedXpSteps: () => {
        if (typeof window !== 'undefined') {
           localStorage.setItem(LOCALSTORAGE_AWARDED_XP_STEPS_KEY, JSON.stringify(get().awardedXpForSteps));
        }
     },
    }),
    {
      name: 'forgesim-guidance-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        shownSteps: state.shownSteps, // Keep persisting shownSteps for display 'once' logic
        awardedXpForSteps: state.awardedXpForSteps, // Persist IDs of steps XP was awarded for
        insightXp: state.insightXp, // Persist total insight XP
      }),
       onRehydrateStorage: () => (state) => {
        if (state) {
          state._loadPersistedData();
        }
      }
    }
  )
);

if (typeof window !== 'undefined') {
  useGuidanceStore.getState()._loadPersistedData();
  useGuidanceStore.getState().loadGuidanceSteps();
}

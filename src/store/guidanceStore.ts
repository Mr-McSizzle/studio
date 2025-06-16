// src/store/guidanceStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GuidanceStep } from '@/types/guidance';
import { predefinedGuidanceSteps } from '@/lib/guidanceData'; // Import local steps

const LOCALSTORAGE_SHOWN_STEPS_KEY = 'forgeSimShownGuidanceSteps';

interface GuidanceState {
  steps: GuidanceStep[];
  shownSteps: string[]; // Array of step IDs that have been shown
  activeGuidance: GuidanceStep | null;
  activeTargetSelector: string | null; // For highlighting
  activeTargetAttachment: GuidanceStep['targetElementAttachment'];

  loadGuidanceSteps: () => void; // Changed from fetchGuidanceSteps
  markStepAsShown: (stepId: string) => void;
  setActiveGuidance: (step: GuidanceStep | null) => void;
  clearActiveGuidance: () => void;
  _loadShownStepsFromLocalStorage: () => void; // Internal, called on init
  _persistShownStepsToLocalStorage: () => void; // Internal
}

export const useGuidanceStore = create<GuidanceState>()(
  persist(
    (set, get) => ({
      steps: [],
      shownSteps: [],
      activeGuidance: null,
      activeTargetSelector: null,
      activeTargetAttachment: undefined,

      loadGuidanceSteps: () => {
        // Load steps from the local data file
        set({ steps: predefinedGuidanceSteps });
      },

      markStepAsShown: (stepId: string) => {
        set((state) => {
          if (!state.shownSteps.includes(stepId)) {
            const newShownSteps = [...state.shownSteps, stepId];
            return { shownSteps: newShownSteps };
          }
          return state;
        });
        get()._persistShownStepsToLocalStorage();
      },

      setActiveGuidance: (step: GuidanceStep | null) => {
        set({ 
          activeGuidance: step, 
          activeTargetSelector: step?.highlightSelector || null,
          activeTargetAttachment: step?.targetElementAttachment || 'center',
        });
      },
      
      clearActiveGuidance: () => {
        if (get().activeGuidance) {
          get().markStepAsShown(get().activeGuidance!.id);
        }
        set({ activeGuidance: null, activeTargetSelector: null, activeTargetAttachment: undefined });
      },

      _loadShownStepsFromLocalStorage: () => {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(LOCALSTORAGE_SHOWN_STEPS_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                set({ shownSteps: parsed });
              }
            } catch (e) {
              console.error("Failed to parse shown guidance steps from localStorage", e);
            }
          }
        }
      },
      _persistShownStepsToLocalStorage: () => {
         if (typeof window !== 'undefined') {
            localStorage.setItem(LOCALSTORAGE_SHOWN_STEPS_KEY, JSON.stringify(get().shownSteps));
         }
      },
    }),
    {
      name: 'forgesim-guidance-storage', 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ shownSteps: state.shownSteps }), 
       onRehydrateStorage: () => (state) => {
        if (state) {
          state._loadShownStepsFromLocalStorage(); 
        }
      }
    }
  )
);

// Initialize shownSteps and load predefined steps when the store is created/hydrated
if (typeof window !== 'undefined') {
  useGuidanceStore.getState()._loadShownStepsFromLocalStorage();
  useGuidanceStore.getState().loadGuidanceSteps(); // Load predefined steps on init
}

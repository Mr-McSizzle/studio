
// src/store/guidanceStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GuidanceStep, FirestoreGuidanceDocument } from '@/types/guidance';
import { db } from '@/lib/firebase'; // Firebase instance
import { doc, getDoc } from 'firebase/firestore';

const FIRESTORE_GUIDANCE_PATH = 'tutorials';
const FIRESTORE_GUIDANCE_DOC_ID = 'hive-mind-guide'; // Document ID containing the 'steps' array
const LOCALSTORAGE_SHOWN_STEPS_KEY = 'forgeSimShownGuidanceSteps';

interface GuidanceState {
  steps: GuidanceStep[];
  shownSteps: string[]; // Array of step IDs that have been shown
  activeGuidance: GuidanceStep | null;
  activeTargetSelector: string | null; // For highlighting
  activeTargetAttachment: GuidanceStep['targetElementAttachment'];
  isFetching: boolean;
  fetchError: string | null;

  fetchGuidanceSteps: () => Promise<void>;
  markStepAsShown: (stepId: string) => void;
  setActiveGuidance: (step: GuidanceStep | null) => void;
  clearActiveGuidance: () => void;
  _loadShownStepsFromLocalStorage: () => void; // Internal, called on init
  _persistShownStepsToLocalStorage: () => void; // Internal
}

export const useGuidanceStore = create<GuidanceState>()(
  // Persist only 'shownSteps' to localStorage
  persist(
    (set, get) => ({
      steps: [],
      shownSteps: [],
      activeGuidance: null,
      activeTargetSelector: null,
      activeTargetAttachment: undefined,
      isFetching: false,
      fetchError: null,

      fetchGuidanceSteps: async () => {
        if (get().isFetching || get().steps.length > 0) return; // Prevent multiple fetches or if already loaded
        set({ isFetching: true, fetchError: null });
        try {
          const docRef = doc(db, FIRESTORE_GUIDANCE_PATH, FIRESTORE_GUIDANCE_DOC_ID);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as FirestoreGuidanceDocument;
            if (data && Array.isArray(data.steps)) {
              set({ steps: data.steps, isFetching: false });
            } else {
              console.warn(`Firestore document at ${FIRESTORE_GUIDANCE_PATH}/${FIRESTORE_GUIDANCE_DOC_ID} is missing 'steps' array or is malformed.`);
              set({ steps: [], fetchError: 'Guidance data malformed.', isFetching: false });
            }
          } else {
            console.warn(`No guidance document found at ${FIRESTORE_GUIDANCE_PATH}/${FIRESTORE_GUIDANCE_DOC_ID}`);
            set({ steps: [], fetchError: 'Guidance definition not found.', isFetching: false });
          }
        } catch (error) {
          console.error("Error fetching guidance steps from Firestore:", error);
          set({ fetchError: error instanceof Error ? error.message : 'Failed to fetch guidance.', isFetching: false });
        }
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
      name: 'forgesim-guidance-storage', // Name for the persisted part of the store
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ shownSteps: state.shownSteps }), // Only persist 'shownSteps'
       onRehydrateStorage: () => (state) => {
        if (state) {
          state._loadShownStepsFromLocalStorage(); // Ensure this is called after rehydration
        }
      }
    }
  )
);

// Initialize shownSteps from localStorage when the store is created/hydrated
if (typeof window !== 'undefined') {
  useGuidanceStore.getState()._loadShownStepsFromLocalStorage();
}

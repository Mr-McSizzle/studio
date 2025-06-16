
// src/store/guidanceStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GuidanceStep, QuestCompletionReward } from '@/types/guidance';
import { predefinedGuidanceSteps, questCompletionRewardsData } from '@/lib/guidanceData';
import { useSimulationStore } from './simulationStore'; // For awarding badges

const LOCALSTORAGE_SHOWN_STEPS_KEY = 'forgeSimShownGuidanceSteps';
const LOCALSTORAGE_AWARDED_XP_STEPS_KEY = 'forgeSimAwardedXpSteps';
const LOCALSTORAGE_COMPLETED_QUESTS_KEY = 'forgeSimCompletedQuests';


interface GuidanceState {
  steps: GuidanceStep[];
  shownSteps: string[];
  awardedXpForSteps: string[];
  completedQuests: string[]; // Array of quest IDs that have been completed
  insightXp: number;
  activeGuidance: GuidanceStep | null;
  activeQuestId: string | null; // ID of the currently active quest
  activeQuestStepId: string | null; // ID of the current step within the active quest

  loadGuidanceSteps: () => void;
  markStepAsShown: (stepId: string) => void;
  setActiveGuidance: (step: GuidanceStep | null) => void;
  clearActiveGuidance: () => void;
  navigateToQuestStep: (stepId: string) => void; // New action for quest navigation
  _loadPersistedData: () => void;
  _persistShownSteps: () => void;
  _persistAwardedXpSteps: () => void;
  _persistCompletedQuests: () => void;
}

export const useGuidanceStore = create<GuidanceState>()(
  persist(
    (set, get) => ({
      steps: [],
      shownSteps: [],
      awardedXpForSteps: [],
      completedQuests: [],
      insightXp: 0,
      activeGuidance: null,
      activeQuestId: null,
      activeQuestStepId: null,

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
        if (step && step.questId) {
          // If this step is part of a quest, update quest-related state
          set({
            activeGuidance: step,
            activeQuestId: step.questId,
            activeQuestStepId: step.id,
          });
        } else {
          // If not part of a quest, or clearing guidance
          set({
            activeGuidance: step,
            activeQuestId: null, // Clear quest context if the step isn't part of one
            activeQuestStepId: null,
          });
        }
      },
      
      navigateToQuestStep: (stepId: string) => {
        const { steps, setActiveGuidance } = get();
        const nextStep = steps.find(s => s.id === stepId);
        if (nextStep) {
          setActiveGuidance(nextStep);
        } else {
          console.warn(`[GuidanceStore] Could not find quest step with ID: ${stepId}`);
          // Optionally clear active quest if step not found, or stay on current
        }
      },

      clearActiveGuidance: () => {
        const currentActiveGuidance = get().activeGuidance;
        const currentActiveQuestId = get().activeQuestId;

        if (currentActiveGuidance) {
          // Award step XP if applicable for the individual step
          if (
            currentActiveGuidance.xpValue &&
            currentActiveGuidance.xpValue > 0 &&
            !get().awardedXpForSteps.includes(currentActiveGuidance.id)
          ) {
            set(state => ({
              insightXp: state.insightXp + (currentActiveGuidance.xpValue || 0),
              awardedXpForSteps: [...state.awardedXpForSteps, currentActiveGuidance.id],
            }));
            get()._persistAwardedXpSteps();
          }
          get().markStepAsShown(currentActiveGuidance.id);

          // Check for Quest Completion
          if (currentActiveGuidance.isQuestEnd && currentActiveQuestId && !get().completedQuests.includes(currentActiveQuestId)) {
            const questRewardDetails = questCompletionRewardsData.find(qr => qr.questId === currentActiveQuestId);
            if (questRewardDetails) {
              set(state => ({
                insightXp: state.insightXp + questRewardDetails.xp, // Add quest XP
                completedQuests: [...state.completedQuests, currentActiveQuestId],
              }));
              get()._persistCompletedQuests();
              
              // Award badge via simulationStore
              useSimulationStore.getState().awardQuestBadge(
                questRewardDetails.badgeName,
                questRewardDetails.badgeDescription,
                currentActiveQuestId,
                questRewardDetails.badgeIcon
              );
              console.log(`Quest ${currentActiveQuestId} completed! Awarded ${questRewardDetails.xp} XP and badge: ${questRewardDetails.badgeName}`);
            }
          }
        }
        // Clear active guidance and quest context
        set({ activeGuidance: null, activeQuestId: null, activeQuestStepId: null });
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
          
           const storedCompletedQuests = localStorage.getItem(LOCALSTORAGE_COMPLETED_QUESTS_KEY);
          if (storedCompletedQuests) {
            try {
              const parsed = JSON.parse(storedCompletedQuests);
              if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                set({ completedQuests: parsed });
              }
            } catch (e) { console.error("Failed to parse completed quests", e); }
          }
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
     _persistCompletedQuests: () => {
      if (typeof window !== 'undefined') {
         localStorage.setItem(LOCALSTORAGE_COMPLETED_QUESTS_KEY, JSON.stringify(get().completedQuests));
      }
   },
    }),
    {
      name: 'forgesim-guidance-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        shownSteps: state.shownSteps,
        awardedXpForSteps: state.awardedXpForSteps,
        completedQuests: state.completedQuests,
        insightXp: state.insightXp,
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

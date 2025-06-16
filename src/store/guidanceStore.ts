
// src/store/guidanceStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GuidanceStep, QuestCompletionReward } from '@/types/guidance';
import { predefinedGuidanceSteps, questCompletionRewardsData } from '@/lib/guidanceData';
import { useSimulationStore } from './simulationStore'; // For awarding badges

const LOCALSTORAGE_SHOWN_STEPS_KEY = 'forgeSimShownGuidanceSteps';
const LOCALSTORAGE_AWARDED_XP_STEPS_KEY = 'forgeSimAwardedXpSteps';
const LOCALSTORAGE_COMPLETED_QUESTS_KEY = 'forgeSimCompletedQuests';
const LOCALSTORAGE_FOUNDER_ACUMEN_SCORE_KEY = 'forgeSimFounderAcumenScore';
const LOCALSTORAGE_FOUNDER_ACUMEN_LEVEL_KEY = 'forgeSimFounderAcumenLevel';
const LOCALSTORAGE_LAST_DAILY_INSIGHT_DATE_KEY = 'forgeSimLastDailyInsightDate';
const LOCALSTORAGE_DAILY_INSIGHT_STREAK_KEY = 'forgeSimDailyInsightStreak';


interface GuidanceState {
  steps: GuidanceStep[];
  shownSteps: string[];
  awardedXpForSteps: string[]; 
  completedQuests: string[]; 
  insightXp: number; 
  activeGuidance: GuidanceStep | null;
  activeQuestId: string | null; 
  activeQuestStepId: string | null; 

  // Phase 3: Gamification additions
  founderAcumenScore: number;
  founderAcumenLevel: string; // e.g., "Novice", "Adept", "Sage"
  lastDailyInsightShownDate: string | null; // Stores "YYYY-MM-DD"
  dailyInsightStreak: number;

  loadGuidanceSteps: () => void;
  markStepAsShown: (stepId: string) => void;
  setActiveGuidance: (step: GuidanceStep | null) => void;
  clearActiveGuidance: () => void;
  navigateToQuestStep: (stepId: string) => void; 
  _updateAcumenMetrics: () => void; // Internal helper
  _loadPersistedData: () => void;
  _persistAllGuidanceData: () => void; // Consolidated persistence
}


const calculateAcumenLevel = (xp: number): { score: number; level: string } => {
  const score = xp;
  let level = "Novice";
  if (xp >= 101) level = "Sage";
  else if (xp >= 51) level = "Adept";
  else if (xp >= 21) level = "Apprentice";
  return { score, level };
};

const getTodayDateString = (): string => new Date().toISOString().split('T')[0];

const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};


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

      founderAcumenScore: 0,
      founderAcumenLevel: "Novice",
      lastDailyInsightShownDate: null,
      dailyInsightStreak: 0,

      loadGuidanceSteps: () => {
        set({ steps: predefinedGuidanceSteps });
      },

      _updateAcumenMetrics: () => {
        const currentInsightXp = get().insightXp;
        const { score, level } = calculateAcumenLevel(currentInsightXp);
        set({ founderAcumenScore: score, founderAcumenLevel: level });
      },

      markStepAsShown: (stepId: string) => {
        set((state) => {
          if (!state.shownSteps.includes(stepId)) {
            return { shownSteps: [...state.shownSteps, stepId] };
          }
          return state;
        });
        get()._persistAllGuidanceData();
      },

      setActiveGuidance: (step: GuidanceStep | null) => {
        if (step && step.questId) {
          set({
            activeGuidance: step,
            activeQuestId: step.questId,
            activeQuestStepId: step.id,
          });
        } else {
          set({
            activeGuidance: step,
            activeQuestId: null, 
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
        }
      },

      clearActiveGuidance: () => {
        const currentActiveGuidance = get().activeGuidance;
        const currentActiveQuestId = get().activeQuestId;
        let currentInsightXp = get().insightXp; // Get current XP before modifications
        let currentDailyStreak = get().dailyInsightStreak;
        let lastShownDate = get().lastDailyInsightShownDate;

        if (currentActiveGuidance) {
          let awardedXpThisInteraction = 0;
          
          if (!get().awardedXpForSteps.includes(currentActiveGuidance.id)) {
            if (currentActiveGuidance.isDiscovery && currentActiveGuidance.discoveryXpValue && currentActiveGuidance.discoveryXpValue > 0) {
              awardedXpThisInteraction = currentActiveGuidance.discoveryXpValue;
            } else if (currentActiveGuidance.xpValue && currentActiveGuidance.xpValue > 0) {
              awardedXpThisInteraction = currentActiveGuidance.xpValue;
            }

            if (awardedXpThisInteraction > 0) {
              currentInsightXp += awardedXpThisInteraction;
              set(state => ({
                awardedXpForSteps: [...state.awardedXpForSteps, currentActiveGuidance.id],
              }));
            }
          }
          
          get().markStepAsShown(currentActiveGuidance.id);

          // Daily Insight Streak Logic
          if (currentActiveGuidance.isDailyInsight) {
            const today = getTodayDateString();
            if (lastShownDate !== today) {
              const yesterday = getYesterdayDateString();
              if (lastShownDate === yesterday) {
                currentDailyStreak++;
              } else {
                currentDailyStreak = 1; // Reset streak if not yesterday or first time
              }
              const streakBonusXp = currentDailyStreak * 1; // Example: 1 XP per day in streak
              currentInsightXp += streakBonusXp;
              console.log(`Daily insight streak: ${currentDailyStreak}, Bonus XP: ${streakBonusXp}`);
              lastShownDate = today;
            }
          }
          
          if (currentActiveGuidance.isQuestEnd && currentActiveQuestId && !get().completedQuests.includes(currentActiveQuestId)) {
            const questRewardDetails = questCompletionRewardsData.find(qr => qr.questId === currentActiveQuestId);
            if (questRewardDetails) {
              currentInsightXp += questRewardDetails.xp; 
              set(state => ({
                completedQuests: [...state.completedQuests, currentActiveQuestId],
              }));
              
              useSimulationStore.getState().awardQuestBadge(
                questRewardDetails.badgeName,
                questRewardDetails.badgeDescription,
                currentActiveQuestId,
                questRewardDetails.badgeIcon
              );
            }
          }
          set({ insightXp: currentInsightXp, dailyInsightStreak: currentDailyStreak, lastDailyInsightShownDate: lastShownDate });
          get()._updateAcumenMetrics();
        }
        set({ activeGuidance: null, activeQuestId: null, activeQuestStepId: null });
        get()._persistAllGuidanceData();
      },

      _loadPersistedData: () => {
        if (typeof window !== 'undefined') {
          const loadItem = (key: string, defaultValue: any, validator?: (val: any) => boolean) => {
            const stored = localStorage.getItem(key);
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                return validator ? (validator(parsed) ? parsed : defaultValue) : parsed;
              } catch (e) { console.error(`Failed to parse ${key}`, e); }
            }
            return defaultValue;
          };

          set({
            shownSteps: loadItem(LOCALSTORAGE_SHOWN_STEPS_KEY, [], (val) => Array.isArray(val) && val.every(item => typeof item === 'string')),
            awardedXpForSteps: loadItem(LOCALSTORAGE_AWARDED_XP_STEPS_KEY, [], (val) => Array.isArray(val) && val.every(item => typeof item === 'string')),
            completedQuests: loadItem(LOCALSTORAGE_COMPLETED_QUESTS_KEY, [], (val) => Array.isArray(val) && val.every(item => typeof item === 'string')),
            insightXp: loadItem('forgesim-guidance-storage', { insightXp: 0 })?.insightXp || 0, // From main persist key
            founderAcumenScore: loadItem(LOCALSTORAGE_FOUNDER_ACUMEN_SCORE_KEY, 0, (val) => typeof val === 'number'),
            founderAcumenLevel: loadItem(LOCALSTORAGE_FOUNDER_ACUMEN_LEVEL_KEY, "Novice", (val) => typeof val === 'string'),
            lastDailyInsightShownDate: loadItem(LOCALSTORAGE_LAST_DAILY_INSIGHT_DATE_KEY, null, (val) => typeof val === 'string' || val === null),
            dailyInsightStreak: loadItem(LOCALSTORAGE_DAILY_INSIGHT_STREAK_KEY, 0, (val) => typeof val === 'number'),
          });
          get()._updateAcumenMetrics(); // Ensure acumen score/level are up-to-date after loading XP
        }
      },
      _persistAllGuidanceData: () => {
         if (typeof window !== 'undefined') {
            const state = get();
            localStorage.setItem(LOCALSTORAGE_SHOWN_STEPS_KEY, JSON.stringify(state.shownSteps));
            localStorage.setItem(LOCALSTORAGE_AWARDED_XP_STEPS_KEY, JSON.stringify(state.awardedXpForSteps));
            localStorage.setItem(LOCALSTORAGE_COMPLETED_QUESTS_KEY, JSON.stringify(state.completedQuests));
            // insightXp is handled by the main persist middleware
            localStorage.setItem(LOCALSTORAGE_FOUNDER_ACUMEN_SCORE_KEY, JSON.stringify(state.founderAcumenScore));
            localStorage.setItem(LOCALSTORAGE_FOUNDER_ACUMEN_LEVEL_KEY, JSON.stringify(state.founderAcumenLevel));
            localStorage.setItem(LOCALSTORAGE_LAST_DAILY_INSIGHT_DATE_KEY, JSON.stringify(state.lastDailyInsightShownDate));
            localStorage.setItem(LOCALSTORAGE_DAILY_INSIGHT_STREAK_KEY, JSON.stringify(state.dailyInsightStreak));
         }
      },
    }),
    {
      name: 'forgesim-guidance-storage', // Main key for persist middleware
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only insightXp needs to be part of the main persist object if others are handled manually
        insightXp: state.insightXp,
      }),
       onRehydrateStorage: () => (state) => {
        // This is called AFTER the main state is rehydrated by persist middleware
        // Now we can load the other manually managed items
        if (state) {
          state._loadPersistedData(); // Call AFTER insightXp is rehydrated
        }
      }
    }
  )
);

// Initialize store listeners and load initial data when the module loads in the browser
if (typeof window !== 'undefined') {
  useGuidanceStore.getState()._loadPersistedData(); 
  useGuidanceStore.getState().loadGuidanceSteps(); 
}


import { create } from 'zustand';
import { useSimulationStore } from './simulationStore'; // To get currency info

interface SuggestedNextAction {
  page: string;
  label: string;
}

interface AiMentorState {
  lastMessage: string | null;
  suggestedNextAction: SuggestedNextAction | null;
  setGuidance: (message: string, suggestion?: SuggestedNextAction) => void;
  clearGuidance: () => void;
  clearSuggestion: () => void;
  getInitialGreeting: () => string; // Function to generate greeting
}

export const useAiMentorStore = create<AiMentorState>((set, get) => ({
  lastMessage: null,
  suggestedNextAction: null,
  setGuidance: (message, suggestion) => set({ lastMessage: message, suggestedNextAction: suggestion }),
  clearGuidance: () => set({ lastMessage: null, suggestedNextAction: null }),
  clearSuggestion: () => set(state => ({ ...state, suggestedNextAction: null })),
  getInitialGreeting: () => {
    // Access simulation store state directly here if needed, or pass as param if used outside component context
    const simState = useSimulationStore.getState();
    const currencyInfo = simState.isInitialized 
      ? `Your current simulation currency is ${simState.financials.currencySymbol} (${simState.financials.currencyCode}). `
      : "Please initialize your simulation to get started. ";
      
    return `Hi, I’m EVE, your AI Queen Hive Mind assistant for ForgeSim. ${currencyInfo}I coordinate our team of specialized AI agents—Alex (Accountant), Maya (Marketing Guru), Ty (Social Media Strategist), Zara (Focus Group Leader), and Leo (Expansion Expert)—to provide you with synthesized insights and personalized guidance. How can I direct our collective intelligence to assist you today?`;
  }
}));

    
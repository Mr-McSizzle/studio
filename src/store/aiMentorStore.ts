
import { create } from 'zustand';

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
}

export const useAiMentorStore = create<AiMentorState>((set) => ({
  lastMessage: null,
  suggestedNextAction: null,
  setGuidance: (message, suggestion) => set({ lastMessage: message, suggestedNextAction: suggestion }),
  clearGuidance: () => set({ lastMessage: null, suggestedNextAction: null }),
  clearSuggestion: () => set(state => ({ ...state, suggestedNextAction: null })),
}));


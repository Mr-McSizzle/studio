
import { create } from 'zustand';
import type { ChatMessage as ChatMessageType } from '@/types'; // Ensure ChatMessageType is imported
import { useSimulationStore } from './simulationStore';

interface SuggestedNextAction {
  page: string;
  label: string;
}

interface AiMentorState {
  lastMessageText: string | null; // Renamed to avoid confusion with messages array
  suggestedNextAction: SuggestedNextAction | null;
  messages: ChatMessageType[];
  setGuidance: (messageContent: string, suggestion?: SuggestedNextAction | null) => void;
  addMessage: (message: ChatMessageType) => void;
  initializeGreeting: (focusedAgentId?: string, focusedAgentName?: string) => void;
  clearSuggestion: () => void;
  clearChatHistory: () => void;
}

export const useAiMentorStore = create<AiMentorState>((set, get) => ({
  lastMessageText: null,
  suggestedNextAction: null,
  messages: [],
  setGuidance: (messageContent, suggestion = null) => {
    const newAssistantMessage: ChatMessageType = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: messageContent,
      timestamp: new Date(),
    };
    set(state => ({
      messages: [...state.messages, newAssistantMessage],
      lastMessageText: messageContent,
      suggestedNextAction: suggestion,
    }));
  },
  addMessage: (message: ChatMessageType) => {
    set(state => ({ messages: [...state.messages, message] }));
    // If the message being added is from the assistant, also update lastMessageText
    if (message.role === 'assistant') {
      set({ lastMessageText: message.content });
    }
  },
  initializeGreeting: (focusedAgentId?: string, focusedAgentName?: string) => {
    if (get().messages.length > 0) return; // Don't add greeting if history exists

    const simState = useSimulationStore.getState();
    const currencyInfo = simState.isInitialized
      ? `Your current simulation currency is ${simState.financials.currencySymbol} (${simState.financials.currencyCode}). `
      : "Please initialize your simulation to get started. ";

    let initialMessageText: string;
    if (focusedAgentId && focusedAgentName) {
      initialMessageText = `EVE: Hello! I see you're looking to chat with ${focusedAgentName}. I can help facilitate that. What specific questions do you have for ${focusedAgentName} regarding their expertise?`;
    } else {
      initialMessageText = `Hi, I’m EVE, your AI Queen Hive Mind assistant for ForgeSim. ${currencyInfo}I coordinate our team of specialized AI agents—Alex (Accountant), Maya (Marketing Guru), Ty (Social Media Strategist), Zara (Focus Group Leader), Leo (Expansion Expert), The Advisor, and Brand Lab—to provide you with synthesized insights and personalized guidance. How can I direct our collective intelligence to assist you today?`;
    }

    const initialMessage: ChatMessageType = {
      id: "initial-eve-greeting-" + (focusedAgentId || "general"),
      role: "assistant",
      content: initialMessageText,
      timestamp: new Date(),
    };
    set({ messages: [initialMessage], lastMessageText: initialMessageText });
  },
  clearSuggestion: () => set(state => ({ ...state, suggestedNextAction: null })),
  clearChatHistory: () => set({ messages: [], lastMessageText: null, suggestedNextAction: null }),
}));
    

import { create } from 'zustand';
import type { ChatMessage as ChatMessageType } from '@/types'; 
import { useSimulationStore } from './simulationStore';

interface SuggestedNextAction {
  page: string;
  label: string;
}

export const EVE_MAIN_CHAT_CONTEXT_ID = "eve_main_chat";

interface AiMentorState {
  lastMessageText: string | null; 
  suggestedNextAction: SuggestedNextAction | null;
  messages: ChatMessageType[]; // This will store ALL messages across all contexts
  setGuidance: (messageContent: string, agentContext: string, suggestion?: SuggestedNextAction | null) => void;
  addMessage: (message: ChatMessageType) => void; // Message object should now include agentContextId
  initializeGreeting: (focusedAgentId?: string, focusedAgentName?: string) => void;
  clearSuggestion: () => void;
  clearChatHistory: () => void;
}

export const useAiMentorStore = create<AiMentorState>((set, get) => ({
  lastMessageText: null,
  suggestedNextAction: null,
  messages: [],
  setGuidance: (messageContent, agentContext, suggestion = null) => {
    const newAssistantMessage: ChatMessageType = {
      id: `assistant-${agentContext}-${Date.now()}`, // Context in ID for easier debugging
      role: "assistant",
      content: messageContent,
      timestamp: new Date(),
      agentContextId: agentContext, // Tag with current context
    };
    set(state => ({
      messages: [...state.messages, newAssistantMessage],
      lastMessageText: messageContent, // Update lastMessageText for the guidance bar
      suggestedNextAction: suggestion,
    }));
  },
  addMessage: (message: ChatMessageType) => { // Expect message to have agentContextId set by ChatInterface or system
    set(state => ({ messages: [...state.messages, message] }));
    if (message.role === 'assistant') { 
      set({ lastMessageText: message.content });
    }
  },
  initializeGreeting: (focusedAgentId?: string, focusedAgentName?: string) => {
    const currentAgentContext = focusedAgentId || EVE_MAIN_CHAT_CONTEXT_ID;
    const existingMessagesForContext = get().messages.filter(msg => msg.agentContextId === currentAgentContext);

    if (existingMessagesForContext.length > 0 && existingMessagesForContext.some(m => m.id.startsWith('initial-eve-greeting'))) {
      // If a greeting for THIS SPECIFIC CONTEXT already exists, don't add another.
      // This allows specific agent chats to get their own greeting if they haven't had one.
      return; 
    }

    const simState = useSimulationStore.getState();
    const currencyInfo = simState.isInitialized
      ? `Your current simulation currency is ${simState.financials.currencySymbol} (${simState.financials.currencyCode}). `
      : "Please initialize your simulation to get started. ";

    let initialMessageText: string;
    if (focusedAgentId && focusedAgentName) {
      initialMessageText = `EVE: Hello! I see you're looking to chat with ${focusedAgentName}. I can help facilitate that. What specific questions do you have for ${focusedAgentName} regarding their expertise?`;
    } else { // Main EVE chat
      initialMessageText = `Hi, I’m EVE, your AI Queen Hive Mind assistant for ForgeSim. ${currencyInfo}I coordinate our team of specialized AI agents—Alex (Accountant), Maya (Marketing Guru), Ty (Social Media Strategist), Zara (Focus Group Leader), Leo (Expansion Expert), The Advisor, and Brand Lab—to provide you with synthesized insights and personalized guidance. How can I direct our collective intelligence to assist you today?`;
    }

    const initialMessage: ChatMessageType = {
      id: `initial-eve-greeting-${currentAgentContext}-${Date.now()}`,
      role: "assistant",
      content: initialMessageText,
      timestamp: new Date(),
      agentContextId: currentAgentContext, 
    };
    
    const currentMessages = get().messages;
    if (!currentMessages.find(m => m.id === initialMessage.id)) { // Prevent duplicate if re-init somehow called rapidly
        set(state => ({ 
            messages: [...state.messages, initialMessage], 
            lastMessageText: initialMessage.content 
        }));
    }
  },
  clearSuggestion: () => set(state => ({ ...state, suggestedNextAction: null })),
  clearChatHistory: () => set({ messages: [], lastMessageText: null, suggestedNextAction: null }),
}));
    


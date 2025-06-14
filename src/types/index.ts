
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  agentContextId?: string; // ID to scope messages to a specific agent chat or main EVE chat
}

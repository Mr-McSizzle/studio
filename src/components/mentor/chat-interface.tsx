
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { FormEvent } from "react";
import { mentorConversation, type MentorConversationInput, type MentorConversationOutput } from "@/ai/flows/mentor-conversation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import type { ChatMessage as ChatMessageType } from "@/types";
import { SendHorizonal, Loader2, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAiMentorStore } from "@/store/aiMentorStore";
import { useSimulationStore } from "@/store/simulationStore";
import { usePathname } from "next/navigation";

interface ChatInterfaceProps {
  focusedAgentId?: string;
  focusedAgentName?: string;
}

const EVE_MAIN_CHAT_CONTEXT_ID = "eve_main_chat";

export function ChatInterface({ focusedAgentId, focusedAgentName }: ChatInterfaceProps) {
  const { messages: allMessages, addMessage, setGuidance, initializeGreeting } = useAiMentorStore();
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const simState = useSimulationStore(state => ({
    isInitialized: state.isInitialized,
    simulationMonth: state.simulationMonth,
    financials: state.financials,
    product: state.product,
    resources: state.resources,
    market: state.market,
  }));
  const pathname = usePathname();

  const currentChatContext = useMemo(() => focusedAgentId || EVE_MAIN_CHAT_CONTEXT_ID, [focusedAgentId]);

  const displayedMessages = useMemo(() => {
    return allMessages.filter(msg => msg.agentContextId === currentChatContext);
  }, [allMessages, currentChatContext]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [displayedMessages]); // Scroll when displayed messages for the current context change

  useEffect(() => {
    initializeGreeting(focusedAgentId, focusedAgentName); // Store handles context-specific greeting logic
    if (focusedAgentId && focusedAgentName && displayedMessages.length <= 1) { 
       setUserInput(`My question for ${focusedAgentName} is about `);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedAgentId, focusedAgentName, initializeGreeting]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: ChatMessageType = {
      id: `user-${currentChatContext}-${Date.now()}`,
      role: "user",
      content: userInput.trim(),
      timestamp: new Date(),
      agentContextId: currentChatContext, // Tag user message with current context
    };
    addMessage(newUserMessage); 
    const currentInput = userInput; 
    setUserInput("");
    setIsLoading(true);

    try {
      // EVE gets the FULL conversation history from all contexts for maximum awareness
      const conversationHistoryForAI = [...useAiMentorStore.getState().messages].map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'tool_response', // Ensure role is correctly typed
        content: msg.content
      }));

      const mentorInput: MentorConversationInput = {
        userInput: currentInput.trim(),
        conversationHistory: conversationHistoryForAI,
        simulationMonth: simState.isInitialized ? simState.simulationMonth : undefined,
        financials: simState.isInitialized ? {
          cashOnHand: simState.financials.cashOnHand,
          burnRate: simState.financials.burnRate,
          revenue: simState.financials.revenue,
          expenses: simState.financials.expenses,
          currencyCode: simState.financials.currencyCode,
          currencySymbol: simState.financials.currencySymbol,
        } : undefined,
        product: simState.isInitialized ? {
          name: simState.product.name,
          stage: simState.product.stage,
          pricePerUser: simState.product.pricePerUser
        } : undefined,
        resources: simState.isInitialized ? {
          marketingSpend: simState.resources.marketingSpend,
          team: simState.resources.team,
          rndSpend: simState.resources.rndSpend,
        } : undefined,
        market: simState.isInitialized ? {
          targetMarketDescription: simState.market.targetMarketDescription,
          competitionLevel: simState.market.competitionLevel,
        } : undefined,
        currentSimulationPage: pathname,
        isSimulationInitialized: simState.isInitialized,
      };

      const result: MentorConversationOutput = await mentorConversation(mentorInput);
      
      // EVE's response is tagged with the current chat context for UI display
      setGuidance(result.response, currentChatContext, result.suggestedNextAction);

    } catch (error) {
      console.error("Error getting EVE's response:", error);
      toast({
        title: "Error",
        description: "Failed to get response from EVE. Please try again.",
        variant: "destructive",
      });
      const errorResponseMessage: ChatMessageType = {
        id: `error-${currentChatContext}-${Date.now()}`,
        role: "system",
        content: "Sorry, I encountered an error connecting to EVE. Please try your request again.",
        timestamp: new Date(),
        agentContextId: currentChatContext, // Tag error message with current context
      };
      addMessage(errorResponseMessage); 
    } finally {
      setIsLoading(false);
    }
  };

  const placeholderText = focusedAgentName
    ? `Ask EVE about ${focusedAgentName}'s domain...`
    : "Ask EVE, your AI Hive Mind...";

  return (
    <div className="flex flex-col h-[calc(100vh-20rem)] max-h-[700px] bg-card shadow-lg rounded-lg">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-2">
          {displayedMessages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
             <div className="flex items-start gap-3 my-4 justify-start">
                <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src="https://placehold.co/40x40.png" alt="EVE AI Avatar" data-ai-hint="robot brain" />
                    <AvatarFallback>
                        <Brain className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] rounded-lg p-3 shadow-md bg-card text-card-foreground">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">EVE is processing...</span>
                    </div>
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form
        onSubmit={handleSubmit}
        className="border-t border-border p-4 flex items-center gap-2 bg-background rounded-b-lg"
      >
        <Input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={placeholderText}
          className="flex-grow"
          disabled={isLoading}
          aria-label="User input for EVE AI assistant"
        />
        <Button type="submit" disabled={isLoading || !userInput.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <SendHorizonal className="h-5 w-5" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
    

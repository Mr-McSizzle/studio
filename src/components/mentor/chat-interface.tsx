
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { FormEvent } from "react";
import { mentorConversation, type MentorConversationInput, type MentorConversationOutput } from "@/ai/flows/mentor-conversation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import type { ChatMessage as ChatMessageType } from "@/types";
import { SendHorizonal, Loader2, Brain, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAiMentorStore } from "@/store/aiMentorStore";
import { useSimulationStore } from "@/store/simulationStore";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  focusedAgentId?: string;
  focusedAgentName?: string;
  isEmbedded?: boolean;
}

const EVE_MAIN_CHAT_CONTEXT_ID = "eve_main_chat";

// Extend the window type for webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export function ChatInterface({ focusedAgentId, focusedAgentName, isEmbedded = false }: ChatInterfaceProps) {
  const { messages: allMessages, addMessage, setGuidance, initializeGreeting } = useAiMentorStore();
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const simStore = useSimulationStore(); // Get the whole store instance
  const {
    isInitialized,
    simulationMonth,
    financials,
    product,
    resources,
    market,
    setMarketingSpend,
    setRndSpend,
    setPricePerUser
  } = simStore;

  const pathname = usePathname();

  const currentChatContext = useMemo(() => focusedAgentId || EVE_MAIN_CHAT_CONTEXT_ID, [focusedAgentId]);

  const displayedMessages = useMemo(() => {
    return allMessages.filter(msg => msg.agentContextId === currentChatContext);
  }, [allMessages, currentChatContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages, isLoading]);

  useEffect(() => {
    initializeGreeting(currentChatContext, focusedAgentId, focusedAgentName);
    if (focusedAgentId && focusedAgentName && allMessages.filter(m => m.agentContextId === currentChatContext).length <= 1) {
       setUserInput(`My question for ${focusedAgentName} is about `);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatContext, focusedAgentId, focusedAgentName, initializeGreeting]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechRecognitionSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({ title: "Voice Recognition Error", description: `An error occurred: ${event.error}`, variant: "destructive" });
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
      
    } else {
      setIsSpeechRecognitionSupported(false);
    }
  }, [toast]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: ChatMessageType = {
      id: `user-${currentChatContext}-${Date.now()}`,
      role: "user",
      content: userInput.trim(),
      timestamp: new Date(),
      agentContextId: currentChatContext,
    };
    addMessage(newUserMessage);
    const currentInput = userInput;
    setUserInput("");
    setIsLoading(true);

    try {
      const conversationHistoryForAI = [...useAiMentorStore.getState().messages]
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'tool_response',
          content: msg.content
      }));

      const mentorInput: MentorConversationInput = {
        userInput: currentInput.trim(),
        conversationHistory: conversationHistoryForAI,
        simulationMonth: isInitialized ? simulationMonth : undefined,
        financials: isInitialized ? {
          cashOnHand: financials.cashOnHand,
          burnRate: financials.burnRate,
          revenue: financials.revenue,
          expenses: financials.expenses,
          currencyCode: financials.currencyCode,
          currencySymbol: financials.currencySymbol,
        } : undefined,
        product: isInitialized ? {
          name: product.name,
          stage: product.stage,
          pricePerUser: product.pricePerUser,
          description: product.features.join(', ')
        } : undefined,
        resources: isInitialized ? {
          marketingSpend: resources.marketingSpend,
          team: resources.team,
          rndSpend: resources.rndSpend,
        } : undefined,
        market: isInitialized ? {
          targetMarketDescription: market.targetMarketDescription,
          competitionLevel: market.competitionLevel,
        } : undefined,
        currentSimulationPage: pathname,
        isSimulationInitialized: isInitialized,
      };

      const result: MentorConversationOutput = await mentorConversation(mentorInput);

      setGuidance(result.response, currentChatContext, result.suggestedNextAction);

      if (isInitialized && result.response) {
        const responseLower = result.response.toLowerCase();
        const currencySymbolRegex = `(?:${financials.currencySymbol.replace('$', '\\$')}|\\$|€|£|¥)`;

        const marketingRegex = new RegExp(`marketing budget.*? to ${currencySymbolRegex}?\\s*([\\d,]+(?:\\.\\d{2})?)`, "i");
        const marketingMatch = result.response.match(marketingRegex);
        if (marketingMatch && marketingMatch[1]) {
          const newBudgetValue = parseFloat(marketingMatch[1].replace(/,/g, ''));
          if (!isNaN(newBudgetValue)) {
            setMarketingSpend(newBudgetValue);
            toast({ title: "Marketing Budget Updated by EVE", description: `Set to ${financials.currencySymbol}${newBudgetValue.toLocaleString()}.` });
            addMessage({id: `system-update-${Date.now()}`, role: "system", content: `[System] EVE set Marketing Budget to ${financials.currencySymbol}${newBudgetValue.toLocaleString()}.`, timestamp: new Date(), agentContextId: currentChatContext});
          }
        }

        const rndRegex = new RegExp(`r&d budget.*? to ${currencySymbolRegex}?\\s*([\\d,]+(?:\\.\\d{2})?)`, "i");
        const rndMatch = result.response.match(rndRegex);
        if (rndMatch && rndMatch[1]) {
          const newBudgetValue = parseFloat(rndMatch[1].replace(/,/g, ''));
          if (!isNaN(newBudgetValue)) {
            setRndSpend(newBudgetValue);
            toast({ title: "R&D Budget Updated by EVE", description: `Set to ${financials.currencySymbol}${newBudgetValue.toLocaleString()}.` });
            addMessage({id: `system-update-${Date.now()+1}`, role: "system", content: `[System] EVE set R&D Budget to ${financials.currencySymbol}${newBudgetValue.toLocaleString()}.`, timestamp: new Date(), agentContextId: currentChatContext});
          }
        }

        const priceRegex = new RegExp(`product price.*? to ${currencySymbolRegex}?\\s*([\\d,]+(?:\\.\\d{2})?)`, "i");
        const priceMatch = result.response.match(priceRegex);
        if (priceMatch && priceMatch[1]) {
          const newPriceValue = parseFloat(priceMatch[1].replace(/,/g, ''));
          if (!isNaN(newPriceValue)) {
            setPricePerUser(newPriceValue);
            toast({ title: "Product Price Updated by EVE", description: `Set to ${financials.currencySymbol}${newPriceValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}.` });
            addMessage({id: `system-update-${Date.now()+2}`, role: "system", content: `[System] EVE set Product Price to ${financials.currencySymbol}${newPriceValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}.`, timestamp: new Date(), agentContextId: currentChatContext});
          }
        }
      }

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
        agentContextId: currentChatContext,
      };
      addMessage(errorResponseMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const placeholderText = focusedAgentName
    ? `Ask EVE about ${focusedAgentName}'s domain... (e.g., 'Set marketing to $5000')`
    : "Ask EVE, your AI Hive Mind... (e.g., 'Change product price to $19.99')";

  return (
    <div
      className={cn(
        "flex flex-col bg-card shadow-lg rounded-lg",
        isEmbedded ? "h-full" : "h-[calc(100vh-15rem)] max-h-[800px]"
        )}
      data-guidance-target="chat-container"
    >
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-2">
          {displayedMessages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
             <div className="flex items-start gap-3 my-4 justify-start">
                <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src="/new-assets/custom_eve_avatar.png" alt="EVE AI Avatar" data-ai-hint="bee queen" />
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
          <div ref={messagesEndRef} />
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
        {isSpeechRecognitionSupported && (
          <Button
            type="button"
            size="icon"
            variant={isRecording ? "destructive" : "outline"}
            onClick={handleMicClick}
            disabled={isLoading}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5 animate-pulse" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        )}
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

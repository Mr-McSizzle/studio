
"use client";

import { useState, useRef, useEffect } from "react";
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const agentFocusPrompts: Record<string, {name: string, promptStart: string}> = {
  'eve-hive-mind': { name: "EVE", promptStart: "EVE, I have a general strategic question: "},
  'alex-accountant': { name: "Alex the Accountant", promptStart: "EVE, I'd like to consult Alex the Accountant regarding my finances. My question is about "},
  'maya-marketing-guru': { name: "Maya the Marketing Guru", promptStart: "EVE, I'd like to ask Maya the Marketing Guru about marketing strategy. Specifically, "},
  'ty-social-media': { name: "Ty the Social Media Strategist", promptStart: "EVE, let's talk to Ty the Social Media Strategist about social media plans for "},
  'zara-focus-group': { name: "Zara, our Focus Group Leader", promptStart: "EVE, I need some customer feedback insights from Zara, our Focus Group Leader, on "},
  'leo-expansion-expert': { name: "Leo the Expansion Expert", promptStart: "EVE, I'm considering expansion and would like Leo the Expansion Expert's input on "},
  'the-advisor': { name: "The Advisor", promptStart: "EVE, I'd like to seek advice from The Advisor on industry best practices concerning "},
  'brand-lab': { name: "the Brand Lab", promptStart: "EVE, I have a branding concept I'd like the Brand Lab to review. It's about "},
};


export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { setGuidance, getInitialGreeting } = useAiMentorStore();

  const simState = useSimulationStore(state => ({
    isInitialized: state.isInitialized,
    simulationMonth: state.simulationMonth,
    financials: state.financials,
    product: state.product,
    resources: state.resources,
    market: state.market,
  }));
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    const focusAgentId = searchParams.get('focus');

    if (messages.length === 0) { // Only set initial greeting if chat is empty
      const initialGreetingText = getInitialGreeting();
      const initialMessage: ChatMessageType = {
        id: "initial-eve-greeting",
        role: "assistant",
        content: initialGreetingText,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
      setGuidance(initialGreetingText);
    }
    
    if (focusAgentId && agentFocusPrompts[focusAgentId] && messages.length <= 1 && !userInput) {
      const agentInfo = agentFocusPrompts[focusAgentId];
      setUserInput(agentInfo.promptStart);
      // Clear the 'focus' query parameter from URL without reloading
      router.replace(pathname, { scroll: false }); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, messages.length]); // React to focus param changes or if messages reset


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userInput.trim(),
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const conversationHistoryForAI = [...messages, newUserMessage].map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'tool_response',
        content: msg.content
      }));
      
      const mentorInput: MentorConversationInput = {
        userInput: newUserMessage.content,
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

      const newMentorMessage: ChatMessageType = {
        id: `mentor-${Date.now()}`,
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, newMentorMessage]);
      setGuidance(result.response, result.suggestedNextAction);

    } catch (error) {
      console.error("Error getting EVE's response:", error);
      toast({
        title: "Error",
        description: "Failed to get response from EVE. Please try again.",
        variant: "destructive",
      });
       const errorResponseMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        role: "system",
        content: "Sorry, I encountered an error connecting to EVE. Please try your request again.",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorResponseMessage]);
      setGuidance("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] max-h-[600px] bg-card shadow-lg rounded-lg">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-2">
          {messages.map((msg) => (
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
          placeholder="Ask EVE, your AI Hive Mind..."
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

   

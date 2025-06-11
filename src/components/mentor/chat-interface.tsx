
"use client";

import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import { mentorConversation, type MentorConversationInput } from "@/ai/flows/mentor-conversation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import type { ChatMessage as ChatMessageType } from "@/types";
import { SendHorizonal, Loader2, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    setMessages([
      {
        id: "initial-hivemind-greeting",
        role: "assistant",
        content: "Greetings! I am your AI Hive Mind Assistant for ForgeSim. I'll help synthesize insights and provide personalized guidance for your startup simulation. How can I assist you today?",
        timestamp: new Date(),
      }
    ]);
  }, []);


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
      const conversationHistoryForAI = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant') // Only send user and assistant messages
        .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }));
      
      const mentorInput: MentorConversationInput = {
        userInput: newUserMessage.content,
        conversationHistory: [...conversationHistoryForAI, {role: 'user', content: newUserMessage.content}],
      };
      
      const result = await mentorConversation(mentorInput);

      const newMentorMessage: ChatMessageType = {
        id: `mentor-${Date.now()}`,
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, newMentorMessage]);
    } catch (error) {
      console.error("Error getting Hive Mind response:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI Hive Mind. Please try again.",
        variant: "destructive",
      });
       const errorResponseMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        role: "system",
        content: "Sorry, I encountered an error connecting to the Hive Mind. Please try your request again.",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[700px] bg-card shadow-lg rounded-lg">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-2">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
             <div className="flex items-start gap-3 my-4 justify-start">
                <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src="https://placehold.co/40x40.png" alt="AI Hive Mind Avatar" data-ai-hint="robot brain" />
                    <AvatarFallback>
                        <Brain className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] rounded-lg p-3 shadow-md bg-card text-card-foreground">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Hive Mind is processing...</span>
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
          placeholder="Ask your AI Hive Mind..."
          className="flex-grow"
          disabled={isLoading}
          aria-label="User input for AI Hive Mind"
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

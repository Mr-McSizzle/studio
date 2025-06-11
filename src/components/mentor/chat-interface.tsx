"use client";

import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import { mentorConversation, type MentorConversationInput } from "@/ai/flows/mentor-conversation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import type { ChatMessage as ChatMessageType } from "@/types";
import { SendHorizonal, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  
  // Initial greeting from mentor
  useEffect(() => {
    setMessages([
      {
        id: "initial-mentor-greeting",
        role: "assistant",
        content: "Hello! I'm your AI Mentor for ForgeSim. How can I assist you with your startup today?",
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
      const conversationHistory = messages.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }));
      
      const mentorInput: MentorConversationInput = {
        userInput: newUserMessage.content,
        // Genkit expects history in {role, content} not full ChatMessageType
        conversationHistory: [...conversationHistory, {role: 'user', content: newUserMessage.content}],
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
      console.error("Error getting mentor response:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI Mentor. Please try again.",
        variant: "destructive",
      });
      // Optionally add the error message back to the chat for the user
       const errorResponseMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        role: "system", // Or assistant, to show it in chat
        content: "Sorry, I encountered an error. Please try again.",
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
            <div className="flex justify-start items-center gap-3 my-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">AI Mentor is thinking...</span>
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
          placeholder="Ask your AI Mentor..."
          className="flex-grow"
          disabled={isLoading}
          aria-label="User input for AI Mentor"
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

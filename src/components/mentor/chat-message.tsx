"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const avatarSrc = isUser ? "https://placehold.co/40x40.png" : "https://placehold.co/40x40.png";
  const avatarHint = isUser ? "user avatar" : "robot avatar";
  const AvatarIcon = isUser ? User : Bot;

  return (
    <div
      className={cn(
        "flex items-start gap-3 my-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 border border-border">
          <AvatarImage src={avatarSrc} alt="AI Mentor Avatar" data-ai-hint={avatarHint} />
          <AvatarFallback>
            <Bot className="h-5 w-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3 shadow-md",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card text-card-foreground"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="mt-1 text-xs opacity-70">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
      {isUser && (
         <Avatar className="h-8 w-8 border border-border">
          <AvatarImage src={avatarSrc} alt="User Avatar" data-ai-hint={avatarHint} />
          <AvatarFallback>
             <User className="h-5 w-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

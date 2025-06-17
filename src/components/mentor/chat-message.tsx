
"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bot, AlertTriangle } from "lucide-react"; // Added AlertTriangle for system/error messages

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isSystem = message.role === "system"; // For error or system messages

  let avatarSrc = "/new-assets/placeholder-avatar.png"; // Default user placeholder
  let avatarHint = "avatar";
  let AvatarIcon = AlertTriangle; // Default for system
  let avatarAlt = "System Message";

  if (isUser) {
    avatarSrc = "/new-assets/placeholder-avatar.png"; // Replace with actual user avatar logic if available
    avatarHint = "user avatar";
    AvatarIcon = User;
    avatarAlt = "User Avatar";
  } else if (isAssistant) {
    avatarSrc = "/new-assets/eve-avatar.png"; // EVE's new avatar
    avatarHint = "bee queen"; 
    AvatarIcon = Bot; 
    avatarAlt = "EVE AI Hive Mind Avatar";
  }

  if (isSystem) {
    return (
      <div className="flex items-center gap-3 my-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/50">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 my-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && ( // Assistant's avatar
        <Avatar className="h-8 w-8 border border-border">
          <AvatarImage src={avatarSrc} alt={avatarAlt} data-ai-hint={avatarHint} />
          <AvatarFallback>
            <AvatarIcon className="h-5 w-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3 shadow-md",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card text-card-foreground" // Assistant messages
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="mt-1 text-xs opacity-70">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
      {isUser && ( // User's avatar
         <Avatar className="h-8 w-8 border border-border">
          <AvatarImage src={avatarSrc} alt={avatarAlt} data-ai-hint={avatarHint} />
          <AvatarFallback>
             <AvatarIcon className="h-5 w-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

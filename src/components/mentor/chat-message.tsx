
"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bot, AlertTriangle } from "lucide-react"; 

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isSystem = message.role === "system"; 

  let userAvatarSrc = "/new-assets/placeholder-avatar.png"; 
  let userAvatarHint = "letter avatar";
  let UserIconFallback = User;
  let userAvatarAlt = "User Avatar";

  // EVE's specific avatar details
  const eveAvatarSrc = "/new-assets/custom_eve_avatar.png";
  const eveAvatarHint = "bee queen";
  const EveIconFallback = Bot; 
  const eveAvatarAlt = "EVE AI Hive Mind Avatar";

  if (isSystem) {
    return (
      <div className="flex items-center gap-3 my-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/50">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    );
  }

  // Format assistant messages to render bold text from markdown and handle newlines.
  const assistantFormattedContent = message.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');

  return (
    <div
      className={cn(
        "flex items-start gap-3 my-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && ( // Assistant's avatar (EVE)
        <Avatar className="h-8 w-8 border border-border rounded-full">
          <AvatarImage src={eveAvatarSrc} alt={eveAvatarAlt} data-ai-hint={eveAvatarHint} className="rounded-full" />
          <AvatarFallback className="rounded-full">
            <EveIconFallback className="h-5 w-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3 shadow-md",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {isAssistant ? (
          <div 
            className="text-sm prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: assistantFormattedContent }}
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
        <p className="mt-1 text-xs opacity-70">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
      {isUser && ( // User's avatar
         <Avatar className="h-8 w-8 border border-border rounded-full">
          <AvatarImage src={userAvatarSrc} alt={userAvatarAlt} data-ai-hint={userAvatarHint} className="rounded-full" />
          <AvatarFallback className="rounded-full">
             <UserIconFallback className="h-5 w-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

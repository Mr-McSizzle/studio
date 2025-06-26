
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bot, AlertTriangle, Play, Pause, Loader2 } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { getAgentProfileById } from "@/lib/agentsData";
import { EVE_MAIN_CHAT_CONTEXT_ID } from "@/store/aiMentorStore";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isSystem = message.role === "system"; 

  const { toast } = useToast();
  const [audioState, setAudioState] = useState({ isLoading: false, isPlaying: false });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = async () => {
    if (audioState.isPlaying) {
      audioRef.current?.pause();
      return;
    }

    // If audio is already loaded, just play it
    if (audioRef.current) {
      audioRef.current.play();
      return;
    }

    setAudioState({ isLoading: true, isPlaying: false });
    
    let voiceId = '21m00Tcm4TlvDq8ikWAM'; // Default to EVE's voice (Rachel)
    if (message.agentContextId && message.agentContextId !== EVE_MAIN_CHAT_CONTEXT_ID) {
      const agentProfile = getAgentProfileById(message.agentContextId);
      if (agentProfile?.voiceId) {
        voiceId = agentProfile.voiceId;
      }
    }

    try {
        const { audioDataUri } = await textToSpeech({ text: message.content, voiceId });
        if (audioDataUri) {
            const audio = new Audio(audioDataUri);
            audioRef.current = audio;
            
            audio.onplay = () => setAudioState({ isLoading: false, isPlaying: true });
            audio.onpause = () => {
              setAudioState({ isLoading: false, isPlaying: false });
              // Don't nullify ref on pause, so we can resume
            };
            audio.onended = () => {
                setAudioState({ isLoading: false, isPlaying: false });
                audioRef.current = null; // Clear so it refetches next time
            };
            audio.onerror = (e) => {
                console.error("Error playing audio:", e);
                setAudioState({ isLoading: false, isPlaying: false });
                toast({ title: "Audio Error", description: "Could not play the audio file.", variant: "destructive" });
            };
            
            audio.play();
        } else {
             throw new Error("No audio data returned from TTS flow");
        }
    } catch (error) {
        console.error("Text-to-Speech Error:", error);
        setAudioState({ isLoading: false, isPlaying: false });
        toast({ title: "Voice Generation Failed", description: "Could not generate speech for this message.", variant: "destructive" });
    }
  };


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
          <div className="flex items-start gap-2">
            <div 
              className="text-sm prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: assistantFormattedContent }}
            />
            <Button onClick={handlePlayPause} size="icon" variant="ghost" className="shrink-0 h-7 w-7 text-muted-foreground hover:text-foreground">
              <span className="sr-only">Play or pause audio</span>
              {audioState.isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : audioState.isPlaying ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
            </Button>
          </div>
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

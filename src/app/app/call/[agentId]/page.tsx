
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Bot, PhoneOff, Circle, Check } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useSimulationStore } from "@/store/simulationStore";
import { useAiMentorStore } from "@/store/aiMentorStore";
import { getAgentProfileById } from "@/lib/agentsData";
import { mentorConversation, type MentorConversationInput } from "@/ai/flows/mentor-conversation";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type CallStatus = "idle" | "listening" | "thinking" | "speaking" | "error";

// Extend the window type for webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function AgentCallPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const agentId = typeof params.agentId === "string" ? params.agentId : "eve-hive-mind";
  const agentProfile = getAgentProfileById(agentId);

  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use a ref to track the latest transcript to avoid stale closures in event handlers
  const transcriptRef = useRef("");
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const { isAuthenticated } = useAuthStore();
  const simState = useSimulationStore();

  const stopAllActivity = () => {
    if (recognitionRef.current) {
        recognitionRef.current.abort(); // Use abort for immediate stop without side-effects
    }
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ''; // Detach source to ensure it stops loading
        audioRef.current = null;
    }
    setCallStatus("idle");
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Main setup and cleanup effect for speech recognition and audio
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = true; // Keep listening while button is held
      recognition.interimResults = true; // Get results as they come in

      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript.trim()) {
           setTranscript(prev => prev + finalTranscript.trim() + ' ');
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== 'aborted') { // Don't show toast on intentional abort
            toast({ title: "Voice Recognition Error", description: `An error occurred: ${event.error}`, variant: "destructive" });
        }
        setCallStatus("error");
      };
      
      recognition.onend = () => {
        // A natural end (e.g. from browser timeout) should reset the state.
        setCallStatus((currentStatus) => {
            if(currentStatus === 'listening') return 'idle';
            return currentStatus;
        });
      };

    } else {
      toast({ title: "Browser Not Supported", description: "Speech recognition is not supported in this browser.", variant: "destructive" });
    }

    // Master cleanup function when component unmounts
    return () => {
        stopAllActivity();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const startListening = () => {
    if (recognitionRef.current && callStatus !== "listening") {
      stopAllActivity(); // Ensure any previous state is cleared before starting
      setTranscript("");
      transcriptRef.current = ""; // Reset ref as well
      setCallStatus("listening");
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setCallStatus("error");
        if (error instanceof Error && error.name === 'InvalidStateError') {
             // This can happen if start is called too quickly after a stop. Our state guard should prevent logical issues.
        } else {
             toast({ title: "Voice Recognition Error", description: "Could not start microphone.", variant: "destructive" });
        }
      }
    }
  };

  const stopListeningAndProcess = async () => {
    if (recognitionRef.current && callStatus === "listening") {
      recognitionRef.current.stop();
      setCallStatus("thinking");

      // Use the ref for the most up-to-date transcript to avoid stale state in async flow
      const finalTranscript = transcriptRef.current.trim();
      
      if (!finalTranscript) {
        setCallStatus("idle");
        return;
      }
      
      const conversationHistoryForAI = [...useAiMentorStore.getState().messages]
        .filter(msg => msg.role !== 'system')
        .map(msg => ({ role: msg.role as 'user' | 'assistant' | 'tool_response', content: msg.content }));

      const mentorInput: MentorConversationInput = {
        userInput: finalTranscript,
        conversationHistory: conversationHistoryForAI,
        simulationMonth: simState.isInitialized ? simState.simulationMonth : undefined,
        financials: simState.isInitialized ? simState.financials : undefined,
        product: simState.isInitialized ? simState.product : undefined,
        resources: simState.isInitialized ? simState.resources : undefined,
        market: simState.isInitialized ? simState.market : undefined,
        currentSimulationPage: `/app/call/${agentId}`,
        isSimulationInitialized: simState.isInitialized,
      };

      try {
        const mentorResult = await mentorConversation(mentorInput);
        
        if (mentorResult.response) {
          setCallStatus("speaking");
          const ttsResult = await textToSpeech({ text: mentorResult.response, voiceId: agentProfile?.voiceId });
          
          if(ttsResult.error) {
              toast({ title: "Voice Generation Failed", description: ttsResult.error, variant: "destructive"});
              setCallStatus("error");
              return;
          }

          if (ttsResult.audioDataUri) {
            const audio = new Audio(ttsResult.audioDataUri);
            audioRef.current = audio;
            audio.play();
            audio.onended = () => {
              setCallStatus("idle");
            };
             audio.onerror = () => {
              toast({ title: "Audio Playback Error", description: "Could not play the agent's voice.", variant: "destructive" });
              setCallStatus("error");
            };
          }
        } else {
            setCallStatus("idle");
        }
      } catch (error) {
        console.error("Call processing error:", error);
        toast({ title: "Error", description: "Failed to get a response from the agent.", variant: "destructive" });
        setCallStatus("error");
      }
    }
  };
  
  const endCall = () => {
      stopAllActivity();
      router.back();
  };

  const getStatusInfo = () => {
    switch (callStatus) {
      case "listening":
        return { text: "Listening...", icon: Mic, pulse: true };
      case "thinking":
        return { text: "Thinking...", icon: Bot, pulse: true };
      case "speaking":
        return { text: `${agentProfile?.shortName || "Agent"} is speaking...`, icon: Bot, pulse: true };
      case "error":
        return { text: "Connection error. Try again.", icon: PhoneOff, pulse: false };
      case "idle":
      default:
        return { text: "Hold to Speak", icon: Mic, pulse: false };
    }
  };

  const { text: statusText, icon: StatusIcon, pulse: isPulsing } = getStatusInfo();
  
  if (!agentProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-destructive">Agent profile not found.</p>
      </div>
    );
  }

  const IconComponent = agentProfile.icon;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl flex flex-col items-center justify-between p-8 z-[1000]">
      <div className="text-center pt-10">
         <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "backOut" }}>
            <Avatar className={cn("h-40 w-40 rounded-lg mb-4 mx-auto border-4 shadow-lg", isPulsing ? "border-accent animate-pulse-glow-border" : "border-primary/30")}>
              <AvatarImage src={agentProfile.avatarUrl} alt={agentProfile.name} />
              <AvatarFallback className={cn("rounded-lg bg-gradient-to-br", agentProfile.gradientFromClass, agentProfile.gradientToClass)}>
                <IconComponent className={cn("h-20 w-20", agentProfile.iconColorClass)} />
              </AvatarFallback>
            </Avatar>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-4xl font-headline text-white"
        >
          {agentProfile.name}
        </motion.h1>
        <motion.p
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
           className="text-lg text-muted-foreground"
        >
          {agentProfile.title}
        </motion.p>
      </div>
      
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center gap-3 h-8">
            <AnimatePresence mode="wait">
                <motion.p
                    key={statusText}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="text-xl font-medium text-white"
                >
                    {statusText}
                </motion.p>
            </AnimatePresence>
        </div>
        <motion.button
          onMouseDown={startListening}
          onMouseUp={stopListeningAndProcess}
          onTouchStart={startListening}
          onTouchEnd={stopListeningAndProcess}
          whileTap={{ scale: 0.9 }}
          className={cn("w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-200 outline-none focus-visible:ring-4 focus-visible:ring-accent/50",
            callStatus === "listening" ? "bg-red-500" : "bg-accent"
          )}
        >
          <StatusIcon className="w-10 h-10 text-accent-foreground" />
        </motion.button>
      </div>

      <div className="w-full max-w-xs">
        <Button onClick={endCall} variant="outline" className="w-full bg-destructive/20 border-destructive text-destructive-foreground hover:bg-destructive/40">
          <PhoneOff className="mr-2 h-5 w-5" /> End Call
        </Button>
      </div>
    </div>
  );
}

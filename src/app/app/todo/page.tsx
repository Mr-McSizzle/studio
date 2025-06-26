
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListTodo, Trash2, GripVertical, Bot } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useSimulationStore } from "@/store/simulationStore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ChatInterface } from "@/components/mentor/chat-interface";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const priorityColorMap = {
  low: "bg-green-500/20 text-green-700 border-green-500/50",
  medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
  high: "bg-red-500/20 text-red-700 border-red-500/50",
};

const difficultyColorMap = {
  easy: "bg-blue-500/20 text-blue-700 border-blue-500/50",
  medium: "bg-purple-500/20 text-purple-700 border-purple-500/50",
  hard: "bg-pink-500/20 text-pink-700 border-pink-500/50",
};


export default function TodoPage() {
  const { isAuthenticated } = useAuthStore();
  const { missions, toggleMissionCompletion } = useSimulationStore(state => ({
    missions: state.missions,
    toggleMissionCompletion: state.toggleMissionCompletion
  }));
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }
  
  const pendingTasks = missions.filter(t => !t.isCompleted).length;

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <ListTodo className="h-10 w-10 text-accent" />
          <div>
            <h1 className="text-3xl font-headline text-foreground">
              Founder's Quest Log
            </h1>
            <p className="text-muted-foreground">
              These are your active objectives assigned by EVE for the current month.
            </p>
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
              <Bot className="mr-2 h-5 w-5" /> Consult EVE on Tasks
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-full max-w-none sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl overflow-y-hidden flex flex-col">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">EVE's Task Guidance</SheetTitle>
              <SheetDescription>
                Ask EVE for advice on prioritizing tasks, breaking them down, or understanding their strategic value.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-grow overflow-y-hidden">
              <ChatInterface isEmbedded />
            </div>
             <div className="p-4 border-t">
                <SheetClose asChild>
                    <Button variant="outline" className="w-full">Close Chat</Button>
                </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GripVertical className="text-muted-foreground h-6 w-6"/>Current Month's Missions</CardTitle>
            <CardDescription>
              {missions.length > 0
                ? `Focus on these objectives to advance your startup. (${pendingTasks} pending)`
                : "No missions have been assigned for this month yet. Advance the simulation on the Dashboard to receive your next set of directives from EVE."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {missions.length > 0 ? (
              <ul className="space-y-3">
                {missions.map((mission) => (
                  <li
                    key={mission.id}
                    className={cn(
                      "flex items-start gap-3 p-4 border rounded-lg bg-card hover:border-primary/70 transition-all duration-200 ease-in-out",
                      mission.isCompleted && "bg-muted/50 opacity-70 hover:opacity-90"
                    )}
                  >
                    <Checkbox
                      id={`mission-${mission.id}`}
                      checked={mission.isCompleted}
                      onCheckedChange={() => toggleMissionCompletion(mission.id)}
                      aria-labelledby={`mission-label-${mission.id}`}
                      className="mt-1 shrink-0 border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground focus-visible:ring-accent"
                    />
                    <div className="flex-grow">
                      <label
                        id={`mission-label-${mission.id}`}
                        htmlFor={`mission-${mission.id}`}
                        className={cn(
                          "text-base font-medium cursor-pointer",
                          mission.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {mission.title}
                      </label>
                      <p className={cn("text-sm text-muted-foreground mt-1", mission.isCompleted && "line-through")}>
                          {mission.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs">
                        {mission.difficulty && <Badge variant="outline" className={cn("font-mono", difficultyColorMap[mission.difficulty])}>D: {mission.difficulty}</Badge>}
                        <Badge variant="outline" className="font-mono border-yellow-500/50 text-yellow-600 bg-yellow-500/10">Reward: {mission.rewardText}</Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-6">
                Awaiting new directives from EVE.
              </p>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

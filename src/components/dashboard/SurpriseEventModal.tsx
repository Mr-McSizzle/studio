"use client";

import { useSimulationStore } from '@/store/simulationStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Zap } from 'lucide-react';

export const SurpriseEventModal = () => {
  const { activeSurpriseEvent, resolveSurpriseEvent } = useSimulationStore(
    (state) => ({
      activeSurpriseEvent: state.activeSurpriseEvent,
      resolveSurpriseEvent: state.resolveSurpriseEvent,
    })
  );

  const handleResolve = (outcome: 'accepted' | 'rejected') => {
    resolveSurpriseEvent(outcome);
  };
  
  const onOpenChange = (open: boolean) => {
    if (!open && activeSurpriseEvent) {
      handleResolve('rejected');
    }
  };

  return (
    <AlertDialog open={!!activeSurpriseEvent} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-accent shadow-accent-glow-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center border border-accent">
                <Zap className="h-6 w-6 text-accent animate-subtle-pulse" />
             </div>
            <AlertDialogTitle className="text-2xl font-headline text-accent">
              {activeSurpriseEvent?.title || 'Surprise Event!'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-muted-foreground pt-2">
            {activeSurpriseEvent?.description || 'An unexpected event has occurred. You must make a choice.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogCancel asChild>
                  <Button
                    variant="outline"
                    onClick={() => handleResolve('rejected')}
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    {activeSurpriseEvent?.options.reject.label || 'Reject'}
                  </Button>
                </AlertDialogCancel>
              </TooltipTrigger>
              {activeSurpriseEvent?.options.reject.description && (
                 <TooltipContent side="bottom">
                  <p>{activeSurpriseEvent.options.reject.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogAction asChild>
                  <Button
                    onClick={() => handleResolve('accepted')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {activeSurpriseEvent?.options.accept.label || 'Accept'}
                  </Button>
                </AlertDialogAction>
              </TooltipTrigger>
              {activeSurpriseEvent?.options.accept.description && (
                <TooltipContent side="bottom">
                  <p>{activeSurpriseEvent.options.accept.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

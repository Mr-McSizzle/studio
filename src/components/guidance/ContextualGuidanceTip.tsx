
// src/components/guidance/ContextualGuidanceTip.tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Lightbulb, CheckCircle, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AttachmentPoint, GuidanceStep } from '@/types/guidance';
import { useGuidanceStore } from '@/store/guidanceStore';

interface ContextualGuidanceTipProps {
  message: string;
  targetElement?: HTMLElement | null;
  attachment?: AttachmentPoint;
  onClose: () => void;
  isVisible: boolean;
  currentStep: GuidanceStep | null;
}

export const ContextualGuidanceTip: React.FC<ContextualGuidanceTipProps> = ({
  message,
  targetElement,
  attachment = 'bottom-center',
  onClose,
  isVisible,
  currentStep,
}) => {
  const tipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, opacity: 0 });
  const [xpAnimationAmount, setXpAnimationAmount] = useState<number | null>(null);

  const { awardedXpForSteps, navigateToQuestStep } = useGuidanceStore(state => ({
    awardedXpForSteps: state.awardedXpForSteps,
    navigateToQuestStep: state.navigateToQuestStep,
  }));

  useEffect(() => {
    if (!isVisible || !tipRef.current) {
      setPosition(prev => ({ ...prev, opacity: 0 }));
      return;
    }

    const PADDING = 12;

    let newTop = window.innerHeight / 2 - (tipRef.current?.offsetHeight || 0) / 2;
    let newLeft = window.innerWidth / 2 - (tipRef.current?.offsetWidth || 0) / 2;
    let transformOrigin = 'center center';

    if (targetElement) {
      const targetRect = targetElement.getBoundingClientRect();
      const tipRect = tipRef.current.getBoundingClientRect();

      switch (attachment) {
        case 'top-start':
          newTop = targetRect.top - tipRect.height - PADDING;
          newLeft = targetRect.left;
          transformOrigin = 'bottom left';
          break;
        case 'top-center':
          newTop = targetRect.top - tipRect.height - PADDING;
          newLeft = targetRect.left + targetRect.width / 2 - tipRect.width / 2;
          transformOrigin = 'bottom center';
          break;
        case 'top-end':
          newTop = targetRect.top - tipRect.height - PADDING;
          newLeft = targetRect.right - tipRect.width;
          transformOrigin = 'bottom right';
          break;
        case 'right-start':
          newTop = targetRect.top;
          newLeft = targetRect.right + PADDING;
          transformOrigin = 'top left';
          break;
        case 'right-center':
          newTop = targetRect.top + targetRect.height / 2 - tipRect.height / 2;
          newLeft = targetRect.right + PADDING;
          transformOrigin = 'center left';
          break;
        case 'right-end':
          newTop = targetRect.bottom - tipRect.height;
          newLeft = targetRect.right + PADDING;
          transformOrigin = 'bottom left';
          break;
        case 'bottom-start':
          newTop = targetRect.bottom + PADDING;
          newLeft = targetRect.left;
          transformOrigin = 'top left';
          break;
        case 'bottom-center':
          newTop = targetRect.bottom + PADDING;
          newLeft = targetRect.left + targetRect.width / 2 - tipRect.width / 2;
          transformOrigin = 'top center';
          break;
        case 'bottom-end':
          newTop = targetRect.bottom + PADDING;
          newLeft = targetRect.right - tipRect.width;
          transformOrigin = 'top right';
          break;
        case 'left-start':
          newTop = targetRect.top;
          newLeft = targetRect.left - tipRect.width - PADDING;
          transformOrigin = 'top right';
          break;
        case 'left-center':
          newTop = targetRect.top + targetRect.height / 2 - tipRect.height / 2;
          newLeft = targetRect.left - tipRect.width - PADDING;
          transformOrigin = 'center right';
          break;
        case 'left-end':
          newTop = targetRect.bottom - tipRect.height;
          newLeft = targetRect.left - tipRect.width - PADDING;
          transformOrigin = 'bottom right';
          break;
        case 'center':
        default:
          break;
      }
    }

    newTop = Math.max(PADDING, Math.min(newTop, window.innerHeight - (tipRef.current?.offsetHeight || 0) - PADDING));
    newLeft = Math.max(PADDING, Math.min(newLeft, window.innerWidth - (tipRef.current?.offsetWidth || 0) - PADDING));

    setPosition({ top: newTop, left: newLeft, opacity: 1 });
    if (tipRef.current) {
      tipRef.current.style.transformOrigin = transformOrigin;
    }
  }, [targetElement, attachment, isVisible, message]);

  useEffect(() => {
    if (xpAnimationAmount !== null) {
      const timer = setTimeout(() => {
        setXpAnimationAmount(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [xpAnimationAmount]);

  const handlePrimaryActionClick = () => {
    if (currentStep && currentStep.xpValue && currentStep.xpValue > 0 && !awardedXpForSteps.includes(currentStep.id)) {
      setXpAnimationAmount(currentStep.xpValue);
    }
    onClose();
  };

  const handleNextStep = () => {
    if (currentStep?.nextStepId) {
      navigateToQuestStep(currentStep.nextStepId);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep?.previousStepId) {
      navigateToQuestStep(currentStep.previousStepId);
    }
  };

  if (!isVisible || !currentStep) return null;

  const isQuestStep = !!currentStep.questId;
  const primaryButtonText = currentStep.isQuestEnd ? "Finish Quest" : "Got it!";

  return (
    <div
      ref={tipRef}
      className={cn(
        "fixed z-[1000] w-80 max-w-[calc(100vw-32px)] p-4 rounded-lg shadow-xl bg-popover text-popover-foreground border border-accent",
        "transition-all duration-300 ease-out",
        "opacity-0 scale-95 data-[visible=true]:opacity-100 data-[visible=true]:scale-100",
        "transform-gpu"
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        opacity: position.opacity,
      }}
      data-visible={isVisible}
      role="tooltip"
    >
      {xpAnimationAmount !== null && (
        <div
          className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-ping-once"
          style={{ animation: 'ping-once 1.5s cubic-bezier(0, 0, 0.2, 1) forwards' }}
        >
          +{xpAnimationAmount} XP!
        </div>
      )}
      <div className="flex items-start gap-3">
        <Lightbulb className="h-6 w-6 text-accent mt-1 shrink-0" />
        <div className="prose prose-sm dark:prose-invert max-w-none text-popover-foreground flex-grow">
          {isQuestStep && currentStep.questTitle && (
            <p className="text-xs font-semibold mb-1 text-accent">
              Quest: {currentStep.questTitle}
              {currentStep.currentStepNumber && currentStep.questTotalSteps && (
                ` (Step ${currentStep.currentStepNumber} of ${currentStep.questTotalSteps})`
              )}
            </p>
          )}
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col space-y-2">
        {isQuestStep && (currentStep.previousStepId || currentStep.nextStepId) && (
          <div className="flex justify-between items-center gap-2">
            {currentStep.previousStepId ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handlePreviousStep}
              >
                <ArrowLeftCircle className="mr-2 h-4 w-4" /> Previous
              </Button>
            ) : <div className="flex-1"></div> /* Placeholder for spacing */}
            {currentStep.nextStepId ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleNextStep}
              >
                Next <ArrowRightCircle className="ml-2 h-4 w-4" />
              </Button>
            ) : <div className="flex-1"></div> /* Placeholder for spacing */}
          </div>
        )}
        <Button
          variant="default"
          size="sm"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={handlePrimaryActionClick}
          aria-label={primaryButtonText}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {primaryButtonText}
        </Button>
      </div>
       <style jsx global>{`
        @keyframes ping-once {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.25);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-ping-once {
          animation: ping-once 1.5s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

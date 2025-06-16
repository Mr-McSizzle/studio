
// src/components/guidance/DynamicGuidanceSystem.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useGuidanceStore } from '@/store/guidanceStore';
import { ContextualGuidanceTip } from './ContextualGuidanceTip';
import type { GuidanceStep } from '@/types/guidance';

const HIGHLIGHT_CLASS = 'guidance-highlight-active';

export const DynamicGuidanceSystem: React.FC = () => {
  const pathname = usePathname();
  const {
    steps,
    shownSteps,
    activeGuidance,
    completedQuests, // Need this to check if a quest is already done
    loadGuidanceSteps,
    setActiveGuidance,
    clearActiveGuidance,
  } = useGuidanceStore();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const highlightedElementRef = useRef<HTMLElement | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadGuidanceSteps();
  }, [loadGuidanceSteps]);

  const clearHighlight = useCallback(() => {
    if (highlightedElementRef.current) {
      highlightedElementRef.current.classList.remove(HIGHLIGHT_CLASS);
      highlightedElementRef.current = null;
    }
  }, []);

  const applyHighlight = useCallback((selector: string | undefined) => {
    clearHighlight();
    if (selector) {
      try {
        const element = document.querySelector(selector) as HTMLElement | null;
        if (element) {
          element.classList.add(HIGHLIGHT_CLASS);
          highlightedElementRef.current = element;
          setTargetElement(element);
        } else {
          console.warn(`[GuidanceSystem] Highlight selector "${selector}" not found.`);
          setTargetElement(null);
        }
      } catch (e) {
        console.error(`[GuidanceSystem] Invalid selector "${selector}":`, e);
        setTargetElement(null);
      }
    } else {
      setTargetElement(null);
    }
  }, [clearHighlight]);

  const handleCloseGuidance = useCallback(() => {
    clearHighlight();
    clearActiveGuidance(); // Store now handles XP, marking shown, and quest completion
  }, [clearActiveGuidance, clearHighlight]);


  useEffect(() => {
    if (activeGuidance) {
      applyHighlight(activeGuidance.highlightSelector);
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    } else {
      clearHighlight();
    }
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [activeGuidance, applyHighlight, clearHighlight]);


  useEffect(() => {
    if (steps.length === 0 || activeGuidance) {
      return; // Don't look for new steps if one is already active or no steps loaded
    }

    const matchedStep = steps.find(step => {
      if (shownSteps.includes(step.id) && step.once) {
        return false; // Skip if 'once' step already shown
      }
      if (step.questId && completedQuests.includes(step.questId) && step.isQuestStart) {
        return false; // Skip starting a quest that's already completed
      }

      if (step.trigger.type === 'pageOpen') {
        return step.trigger.path === pathname;
      }
      // Future: Add other trigger type evaluations here
      return false;
    });

    if (matchedStep) {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

      const delay = matchedStep.trigger.delayMs || 0;
      timeoutIdRef.current = setTimeout(() => {
        setActiveGuidance(matchedStep); // This will also set quest context in store if applicable
      }, delay);
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [pathname, steps, shownSteps, activeGuidance, completedQuests, setActiveGuidance]);


  return (
    <ContextualGuidanceTip
      isVisible={!!activeGuidance}
      message={activeGuidance?.message || ""}
      targetElement={targetElement}
      attachment={activeGuidance?.targetElementAttachment || 'bottom-center'}
      onClose={handleCloseGuidance}
      currentStep={activeGuidance}
    />
  );
};

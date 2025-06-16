
// src/components/guidance/DynamicGuidanceSystem.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useGuidanceStore } from '@/store/guidanceStore';
import { ContextualGuidanceTip } from './ContextualGuidanceTip';
import type { GuidanceStep } from '@/types/guidance';

const HIGHLIGHT_CLASS = 'guidance-highlight-active';
const getTodayDateString = (): string => new Date().toISOString().split('T')[0];

export const DynamicGuidanceSystem: React.FC = () => {
  const pathname = usePathname();
  const {
    steps,
    shownSteps,
    activeGuidance,
    completedQuests,
    lastDailyInsightShownDate, // Get this from the store
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
    clearActiveGuidance(); 
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
      return; 
    }
    const today = getTodayDateString();

    const matchedStep = steps.find(step => {
      if (shownSteps.includes(step.id) && step.once) {
        return false; 
      }
      if (step.questId && completedQuests.includes(step.questId) && step.isQuestStart) {
        return false; 
      }

      // Daily Insight Check: If it's a daily insight and one has already been shown today, don't match.
      if (step.isDailyInsight && lastDailyInsightShownDate === today) {
          // Exception: If THIS specific daily insight is currently active (e.g. user navigated away and back), allow it.
          // This simple check might not be enough if we want to cycle through multiple daily insights per day.
          // For now, one daily insight shown (any) blocks others for the day if their trigger matches.
          // To be more precise, we'd need to track *which* daily insight was shown, or if we only allow ONE per day total.
          // Assuming for now: if *any* daily insight was shown via lastDailyInsightShownDate, don't trigger another *different* one.
          // A better approach would be to store the ID of the daily insight shown, but this is simpler for now.
          // If we want to allow *different* daily insights on the same day if their triggers match, this check needs refinement.
          // For now, if a daily was already shown, this step (if it's daily) won't trigger.
          return false;
      }


      if (step.trigger.type === 'pageOpen') {
        return step.trigger.path === pathname;
      }
      
      return false;
    });

    if (matchedStep) {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

      const delay = matchedStep.trigger.delayMs || 0;
      timeoutIdRef.current = setTimeout(() => {
        // If the matched step is a daily insight, and lastDailyInsightShownDate is NOT today, it's eligible.
        // The store will handle marking lastDailyInsightShownDate upon dismissal.
        if (matchedStep.isDailyInsight && lastDailyInsightShownDate === today) {
            // This condition is now technically redundant due to the check above, but for safety:
            console.log("[GuidanceSystem] Daily insight already shown today, not activating new one via this trigger.");
        } else {
            setActiveGuidance(matchedStep);
        }
      }, delay);
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [pathname, steps, shownSteps, activeGuidance, completedQuests, lastDailyInsightShownDate, setActiveGuidance]);


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

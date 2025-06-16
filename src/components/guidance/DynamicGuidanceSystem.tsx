
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
    lastDailyInsightShownDate,
    activeTipThemeId, // Get active theme ID from store
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

      if (step.isDailyInsight && lastDailyInsightShownDate === today) {
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
        if (matchedStep.isDailyInsight && lastDailyInsightShownDate === today) {
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
      activeThemeId={activeTipThemeId} // Pass the active theme ID
    />
  );
};

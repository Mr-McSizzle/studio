
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
    // The ContextualGuidanceTip will handle its own XP animation based on currentStep.
    // This function's main job is to tell the store to clear the active guidance,
    // which in turn will update XP and mark as shown in the store.
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

    const matchedStep = steps.find(step => {
      if (step.trigger.type === 'pageOpen') {
        const isMatch = step.trigger.path === pathname;
        // Check against shownSteps for 'once' display logic
        const alreadyShownForDisplay = step.once && shownSteps.includes(step.id);
        return isMatch && !alreadyShownForDisplay;
      }
      return false;
    });

    if (matchedStep) {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

      const delay = matchedStep.trigger.delayMs || 0;
      timeoutIdRef.current = setTimeout(() => {
        setActiveGuidance(matchedStep);
      }, delay);
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };

  }, [pathname, steps, shownSteps, setActiveGuidance, activeGuidance]);


  return (
    <ContextualGuidanceTip
      isVisible={!!activeGuidance}
      message={activeGuidance?.message || ""}
      targetElement={targetElement}
      attachment={activeGuidance?.targetElementAttachment || 'bottom-center'}
      onClose={handleCloseGuidance}
      currentStep={activeGuidance} // Pass the full step object
    />
  );
};

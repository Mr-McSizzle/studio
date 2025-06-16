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
    loadGuidanceSteps, // Changed from fetchGuidanceSteps
    setActiveGuidance,
    clearActiveGuidance,
  } = useGuidanceStore();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const highlightedElementRef = useRef<HTMLElement | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadGuidanceSteps(); // Load steps from local data on mount
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
          // Optional: scroll into view if desired, can be configured per step
          // element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
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

    const matchedStep = steps.find(step => {
      if (step.trigger.type === 'pageOpen') {
        const isMatch = step.trigger.path === pathname;
        const alreadyShown = step.once && shownSteps.includes(step.id);
        return isMatch && !alreadyShown;
      }
      // Future: Add other trigger type evaluations (elementVisible, elementClick, etc.)
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
    />
  );
};

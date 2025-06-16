
// src/components/guidance/DynamicGuidanceSystem.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useGuidanceStore } from '@/store/guidanceStore';
import { ContextualGuidanceTip } from './ContextualGuidanceTip';
import type { GuidanceStep } from '@/types/guidance';
// Removed useSimulationStore import as it's not directly used for triggers in this simplified first pass

const HIGHLIGHT_CLASS = 'guidance-highlight-active';

export const DynamicGuidanceSystem: React.FC = () => {
  const pathname = usePathname();
  const {
    steps,
    shownSteps,
    activeGuidance,
    fetchGuidanceSteps,
    setActiveGuidance,
    clearActiveGuidance,
    markStepAsShown, // This will be called by clearActiveGuidance implicitly
  } = useGuidanceStore();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const highlightedElementRef = useRef<HTMLElement | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchGuidanceSteps();
  }, [fetchGuidanceSteps]);

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
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
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
    if (activeGuidance) {
      // markStepAsShown(activeGuidance.id); // This is now handled by clearActiveGuidance
    }
    clearActiveGuidance();
  }, [clearActiveGuidance, clearHighlight, activeGuidance]);


  useEffect(() => {
    // This effect handles showing a new guide when activeGuidance changes
    if (activeGuidance) {
      applyHighlight(activeGuidance.highlightSelector);
      
      // If a previous timeout was set (e.g. for another guide), clear it
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      // Set a new timeout if this guide is intended to auto-close or has other timed behavior
      // For now, guides are closed manually by the user via ContextualGuidanceTip's close button.
    } else {
      // If activeGuidance becomes null (e.g., closed by user), ensure highlight is cleared.
      clearHighlight();
    }
    // Ensure cleanup when component unmounts or activeGuidance is cleared
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      // Don't clear highlight here on unmount, only when explicitly closed or new guide shown
    };
  }, [activeGuidance, applyHighlight, clearHighlight]);


  useEffect(() => {
    // This effect evaluates triggers when pathname or steps change
    if (steps.length === 0 || activeGuidance) { // Don't check for new guides if one is already active or no steps loaded
      return;
    }

    // Simple PageOpen Trigger Evaluation
    const matchedStep = steps.find(step => {
      if (step.trigger.type === 'pageOpen') {
        // Basic string match. For regex, need more complex logic.
        const isMatch = step.trigger.path === pathname;
        const alreadyShown = step.once && shownSteps.includes(step.id);
        // TODO: Implement 'dependsOn' logic if needed
        return isMatch && !alreadyShown;
      }
      return false;
    });

    if (matchedStep) {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current); // Clear any pending timeout from a previous potential match

      const delay = matchedStep.trigger.delayMs || 0;
      timeoutIdRef.current = setTimeout(() => {
        setActiveGuidance(matchedStep);
      }, delay);
    } else {
      // If no step matches the current path, and a guide was previously active (but not for this path), clear it.
      // This logic might need refinement if guides should persist across non-matching pages.
      // For now, assume a guide is tied to its trigger condition.
      if (activeGuidance && activeGuidance.trigger.type === 'pageOpen' && activeGuidance.trigger.path !== pathname) {
         // No, handleCloseGuidance() or clearActiveGuidance() should be called by the tip itself or if new guide overrides.
         // We don't want to auto-close a guide just because the path changed if it's meant to be sticky until dismissed.
      }
    }
    
    // Cleanup timeout if component unmounts or dependencies change before timeout fires
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

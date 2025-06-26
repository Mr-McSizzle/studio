
"use client";

import { useSimulationStore } from '@/store/simulationStore';
import { EveEventOverlay } from './EveEventOverlay';

export const SurpriseEventModal = () => {
  const { activeSurpriseEvent, resolveSurpriseEvent } = useSimulationStore(
    (state) => ({
      activeSurpriseEvent: state.activeSurpriseEvent,
      resolveSurpriseEvent: state.resolveSurpriseEvent,
    })
  );

  const handleResolve = (outcome: 'accepted' | 'rejected' | 'acknowledged') => {
    if (outcome === 'accepted' || outcome === 'rejected') {
      resolveSurpriseEvent(outcome);
    }
  };
  
  return (
    <EveEventOverlay
      isOpen={!!activeSurpriseEvent}
      title={activeSurpriseEvent?.title || 'Surprise Event!'}
      description={activeSurpriseEvent?.description || 'An unexpected event has occurred. You must make a choice.'}
      acceptOption={{
        label: activeSurpriseEvent?.options.accept.label || 'Accept',
        description: activeSurpriseEvent?.options.accept.description || 'Accept the consequences.',
      }}
      rejectOption={{
        label: activeSurpriseEvent?.options.reject.label || 'Reject',
        description: activeSurpriseEvent?.options.reject.description || 'Reject the offer.',
      }}
      onResolve={handleResolve}
    />
  );
};

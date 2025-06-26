
"use client";

import { useSimulationStore } from '@/store/simulationStore';
import { EveEventOverlay } from './EveEventOverlay';

export const MonthlySummaryModal = () => {
  const { activeMonthlySummary, acknowledgeMonthlySummary } = useSimulationStore(
    (state) => ({
      activeMonthlySummary: state.activeMonthlySummary,
      acknowledgeMonthlySummary: state.acknowledgeMonthlySummary,
    })
  );

  const handleAcknowledge = () => {
    acknowledgeMonthlySummary();
  };

  const formattedDescription = activeMonthlySummary?.description
    .replace(/\n/g, '<br />')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || 'EVE is ready with your monthly summary.';
  
  return (
    <EveEventOverlay
      isOpen={!!activeMonthlySummary}
      title={activeMonthlySummary?.title || 'Monthly Debrief'}
      description={formattedDescription}
      mode="summary"
      acceptOption={{
        label: 'Acknowledge & Continue',
        description: 'Review the monthly summary and continue.',
      }}
      rejectOption={{ label: '', description: '' }} // Not used in summary mode
      onResolve={handleAcknowledge}
    />
  );
};

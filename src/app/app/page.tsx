
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimulationStore } from '@/store/simulationStore';
import { Loader2 } from 'lucide-react';

export default function AppRootPage() {
  const router = useRouter();
  const { isInitialized, simulationMonth } = useSimulationStore(); // simulationMonth to ensure store is hydrated

  useEffect(() => {
    // Ensure the store is hydrated before checking isInitialized
    if (typeof simulationMonth === 'number') { // Check if store is likely hydrated
      if (!isInitialized) {
        router.replace('/app/setup');
      } else {
        router.replace('/app/dashboard');
      }
    }
  }, [isInitialized, router, simulationMonth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-foreground">
      <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
      <p className="text-lg">Loading ForgeSim experience...</p>
    </div>
  );
}

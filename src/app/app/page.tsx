
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimulationStore } from '@/store/simulationStore';
import { useAuthStore } from '@/store/authStore'; 
import { Loader2 } from 'lucide-react';

export default function AppRootPage() {
  const router = useRouter();
  const { isAuthenticated, userEmail } = useAuthStore(); 
  const { isInitialized: simIsInitialized, simulationMonth } = useSimulationStore();

  useEffect(() => {
    // Wait for auth state to be loaded from localStorage
    if (userEmail === undefined) { 
      return; // Still loading auth state
    }

    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      // Auth is true, now check simulation state (ensure store is hydrated)
      if (typeof simulationMonth === 'number') { 
        if (!simIsInitialized) {
          router.replace('/app/setup');
        } else {
          router.replace('/app/dashboard');
        }
      }
    }
  }, [isAuthenticated, userEmail, simIsInitialized, router, simulationMonth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-foreground">
      <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
      <p className="text-lg">Loading ForgeSim experience...</p>
      <p className="text-sm text-muted-foreground">Verifying session and simulation integrity...</p>
    </div>
  );
}

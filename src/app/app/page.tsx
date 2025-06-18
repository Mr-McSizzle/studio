
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimulationStore } from '@/store/simulationStore';
import { useAuthStore } from '@/store/authStore'; 
import { Loader2, ShieldCheck, Settings2, Activity } from 'lucide-react';
import { ForgeSimLogo } from '@/components/icons/logo';

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
      if (typeof simulationMonth === 'number') { // This ensures simulation store is also hydrated
        if (!simIsInitialized) {
          router.replace('/app/setup');
        } else {
          router.replace('/app/dashboard');
        }
      }
    }
  }, [isAuthenticated, userEmail, simIsInitialized, router, simulationMonth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-foreground p-6">
      <div className="relative mb-6">
        <ForgeSimLogo className="h-24 w-24 text-primary animate-subtle-pulse" />
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 text-accent/50 animate-spin-slow opacity-50" />
      </div>
      <h2 className="text-2xl font-headline text-glow-primary mb-2">Engaging Simulation Core...</h2>
      <p className="text-md text-muted-foreground mb-6 max-w-md text-center">
        Verifying credentials and loading your digital twin. Please wait a moment.
      </p>
      <div className="flex space-x-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-green-500"/> Secure Connection
        </div>
        <div className="flex items-center gap-1.5">
          <Settings2 className="h-4 w-4 text-blue-500 animate-spin-slowest"/> Calibrating AI Agents
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-purple-500"/> Initializing Digital Twin
        </div>
      </div>
    </div>
  );
}
    
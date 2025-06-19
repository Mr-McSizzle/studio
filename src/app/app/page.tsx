
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2, ShieldCheck, Settings2, Activity, Rocket } from 'lucide-react';
import { ForgeSimLogo } from '@/components/icons/logo';

export default function AppRootPage() {
  const router = useRouter();
  const { isAuthenticated, userEmail } = useAuthStore();

  useEffect(() => {
    if (userEmail === undefined) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      router.replace('/app/launchpad');
    }
  }, [isAuthenticated, userEmail, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-foreground p-6">
      <div className="relative mb-6">
        <ForgeSimLogo className="h-24 w-24 text-primary animate-subtle-pulse" />
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 text-accent/50 animate-spin-slow opacity-50" />
      </div>
      <h2 className="text-2xl font-headline text-glow-primary mb-2">Engaging Simulation Core...</h2>
      <p className="text-md text-muted-foreground mb-6 max-w-md text-center">
        Verifying credentials and preparing your Inceptico Launchpad. Please wait.
      </p>
      <div className="flex space-x-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-green-500"/> Secure Connection
        </div>
        <div className="flex items-center gap-1.5">
          <Settings2 className="h-4 w-4 text-blue-500 animate-spin-slowest"/> Initializing Launchpad
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-purple-500"/> Verifying Access
        </div>
      </div>
    </div>
  );
}
    
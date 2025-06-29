"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChatInterface } from "@/components/mentor/chat-interface";
import { Button } from '@/components/ui/button';
import { Phone, Loader2 } from 'lucide-react';

export default function PostLaunchMentorPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading mentor interface...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline text-foreground">Post-Launch Hive Mind</h1>
          <p className="text-muted-foreground">
            Continue your conversation with EVE for advanced strategic guidance.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/call/eve-hive-mind">
            <Phone className="mr-2 h-4 w-4" />
            Call EVE
          </Link>
        </Button>
      </header>
      <ChatInterface />
    </div>
  );
}
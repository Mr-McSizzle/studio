
"use client"; 

import type { ReactNode } from "react";
import Link from "next/link";
import { PanelLeft, MessagesSquare, ChevronRight, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 

import { ForgeSimLogo } from "@/components/icons/logo";
import { SidebarNav, MobileSidebarNav, SidebarToggleButton } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAiMentorStore } from "@/store/aiMentorStore"; 
import { useAuthStore } from "@/store/authStore"; // Import auth store

// HiveMindGuidanceBar component
function HiveMindGuidanceBar() {
  const { lastMessage, suggestedNextAction, clearSuggestion } = useAiMentorStore();
  const router = useRouter();

  const handleSuggestionClick = () => {
    if (suggestedNextAction?.page) {
      router.push(suggestedNextAction.page);
      clearSuggestion(); 
    }
  };
  
  const handleAskMentor = () => {
    router.push('/app/mentor'); 
  };

  if (!lastMessage && !suggestedNextAction) {
    return null; 
  }

  return (
    <Card className="mb-6 shadow-md border-accent/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-base font-semibold text-accent flex items-center">
          <Lightbulb className="h-5 w-5 mr-2" />
          Hive Mind Guidance
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 text-sm">
        {lastMessage && <p className="text-muted-foreground mb-3 whitespace-pre-wrap">{lastMessage}</p>}
        <div className="flex items-center gap-3 flex-wrap">
          {suggestedNextAction?.label && suggestedNextAction?.page && (
            <Button onClick={handleSuggestionClick} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {suggestedNextAction.label}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
           <Button onClick={handleAskMentor} size="sm" variant="outline">
              Ask Hive Mind
              <MessagesSquare className="h-4 w-4 ml-2" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, userEmail } = useAuthStore(); // Get auth state

  useEffect(() => {
    // If auth state is resolved (not undefined) and user is not authenticated
    if (userEmail === undefined) return; // Still loading auth state from storage

    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, userEmail, router]);


  const closeMobileSheet = () => setIsMobileSheetOpen(false);
  
  // Prevent rendering children if not authenticated, router.replace is async
  if (!isAuthenticated && userEmail !== undefined) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
            <p>Redirecting to login...</p>
            {/* Optionally, a loader icon */}
        </div>
    );
  }


  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r bg-sidebar text-sidebar-foreground">
            <SidebarHeader className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
              <Link href="/app/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-foreground hover:text-sidebar-accent transition-colors">
                <ForgeSimLogo className="h-7 w-7" />
                <span className="font-headline text-lg">ForgeSim</span>
              </Link>
              <div className="hidden md:block">
                <SidebarToggleButton/>
              </div>
            </SidebarHeader>
            <SidebarContent className="flex flex-col p-2">
              <SidebarNav />
            </SidebarContent>
            <SidebarFooter className="p-2 border-t border-sidebar-border">
              {/* Footer content if any */}
            </SidebarFooter>
          </Sidebar>

          <div className="flex flex-col sm:gap-4 sm:py-4 md:ml-[var(--sidebar-width-icon)] peer-data-[state=expanded]:md:ml-[var(--sidebar-width)] transition-[margin-left] duration-200 ease-linear">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
              <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground border-sidebar-border">
                   <div className="h-16 flex items-center px-4 border-b border-sidebar-border mb-4">
                    <Link href="/app/dashboard" onClick={closeMobileSheet} className="flex items-center gap-2 font-semibold text-sidebar-foreground hover:text-sidebar-accent transition-colors">
                      <ForgeSimLogo className="h-7 w-7" />
                      <span className="font-headline text-lg">ForgeSim</span>
                    </Link>
                  </div>
                  <MobileSidebarNav onLinkClick={closeMobileSheet} />
                </SheetContent>
              </Sheet>
            </header>
            <SidebarInset className="p-4 sm:px-6 sm:py-0">
              <HiveMindGuidanceBar /> 
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

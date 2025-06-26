
"use client"; 

import type { ReactNode } from "react";
import Link from "next/link";
import { PanelLeft, LogOut, Settings, LayoutDashboard, Rocket } from "lucide-react"; 
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; 

import { IncepticoLogo } from "@/components/icons/logo"; // Updated import
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore"; 
import { DynamicGuidanceSystem } from "@/components/guidance/DynamicGuidanceSystem";
import { SurpriseEventModal } from "@/components/dashboard/SurpriseEventModal";

function UserProfileFooter() {
  const router = useRouter();
  const { userName, userEmail, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col gap-1">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 p-2 h-auto text-left"
              onClick={() => router.push('/app/profile')}
            >
              <Avatar className="h-8 w-8 border-2 border-sidebar-accent">
                <AvatarImage src={`https://placehold.co/40x40.png?text=${userName ? userName.charAt(0).toUpperCase() : 'F'}`} alt={userName || "Founder"} data-ai-hint="letter avatar"/>
                <AvatarFallback>{userName ? userName.charAt(0).toUpperCase() : "F"}</AvatarFallback>
              </Avatar>
              <div className="text-sm group-data-[sidebar-state=collapsed]:hidden">
                <p className="font-semibold text-sidebar-foreground truncate max-w-[100px]">{userName || "Founder"}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate max-w-[100px]">{userEmail || "No email"}</p>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" align="start" className="group-data-[sidebar-state=expanded]:hidden bg-popover/80 backdrop-blur-lg border-accent/50">
            <p>{userName || "Founder Profile"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[sidebar-state=expanded]:justify-start group-data-[sidebar-state=collapsed]:justify-center"
              onClick={() => router.push('/app/launchpad')}
              aria-label="Back to Launchpad"
            >
              <Rocket className="h-4 w-4 group-data-[sidebar-state=expanded]:mr-2" />
              <span className="group-data-[sidebar-state=collapsed]:hidden">Launchpad</span>
            </Button>
          </TooltipTrigger>
           <TooltipContent side="right" align="start" className="group-data-[sidebar-state=expanded]:hidden bg-popover/80 backdrop-blur-lg border-accent/50">
            <p>Back to Launchpad</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[sidebar-state=expanded]:justify-start group-data-[sidebar-state=collapsed]:justify-center"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4 group-data-[sidebar-state=expanded]:mr-2" />
              <span className="group-data-[sidebar-state=collapsed]:hidden">Logout</span>
            </Button>
          </TooltipTrigger>
           <TooltipContent side="right" align="start" className="group-data-[sidebar-state=expanded]:hidden bg-popover/80 backdrop-blur-lg border-accent/50">
            <p>Logout</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, userEmail } = useAuthStore(); 
  const pathname = usePathname();

  useEffect(() => {
    if (userEmail === undefined) return; 

    const specialPages = ['/app/login', '/app/signup', '/app/launchpad', '/app/simulation-hub', '/app/profile', '/app/gamification'];
    if (pathname.startsWith('/app') && !specialPages.some(p => pathname === p)) {
      if (!isAuthenticated) {
        router.replace('/login');
      }
    } else if ((pathname === '/app/launchpad' || pathname === '/app/simulation-hub' || pathname === '/app/profile' || pathname === '/app/gamification') && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, userEmail, router, pathname]);


  const closeMobileSheet = () => setIsMobileSheetOpen(false);
  
  if (userEmail === undefined && pathname !== '/login' && pathname !== '/signup') { 
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <IncepticoLogo className="h-20 w-20 text-primary animate-subtle-pulse mb-4"/>
            <p className="text-lg text-glow-primary">Initializing Secure Session...</p>
        </div>
    );
  }

  if (!isAuthenticated && pathname.startsWith('/app') && !pathname.startsWith('/app/login') && !pathname.startsWith('/app/signup')) { 
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <IncepticoLogo className="h-20 w-20 text-primary animate-subtle-pulse mb-4"/>
            <p className="text-lg text-glow-primary">Redirecting to Secure Access Point...</p>
        </div>
    );
  }

  // Hide sidebar for Launchpad, Sim Hub, and Profile pages
  if (pathname === '/app/launchpad' || pathname === '/app/simulation-hub' || pathname === '/app/profile' || pathname === '/app/gamification') {
    return (
      <TooltipProvider>
        <div className="min-h-screen w-full bg-background">
          {children}
          <DynamicGuidanceSystem />
          <SurpriseEventModal />
        </div>
      </TooltipProvider>
    );
  }


  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full flex-col bg-background">
          <Sidebar 
            collapsible="icon" 
            side="left" 
            variant="sidebar" 
            className="border-r bg-sidebar text-sidebar-foreground shadow-2xl border-sidebar-border"
          >
            <SidebarHeader className="h-20 flex items-center justify-between px-4 border-b border-sidebar-border">
              <Link href="/app/dashboard" className="flex items-center gap-2.5 font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors">
                <IncepticoLogo className="h-10 w-10 text-primary group-hover:text-accent transition-colors duration-300" /> 
                <span className="font-headline text-2xl text-glow-accent group-data-[sidebar-state=collapsed]:hidden">Inceptico</span>
              </Link>
              <div className="hidden md:block group-data-[sidebar-state=expanded]:opacity-100 group-data-[sidebar-state=collapsed]:opacity-0 transition-opacity">
                <SidebarToggleButton/>
              </div>
            </SidebarHeader>
            <SidebarContent className="flex flex-col p-2 flex-grow">
              <SidebarNav />
            </SidebarContent>
            <SidebarFooter className="p-2 border-t border-sidebar-border">
              <UserProfileFooter />
            </SidebarFooter>
          </Sidebar>

          <div className="flex flex-col sm:gap-4 sm:py-4 md:ml-[var(--sidebar-width-icon)] peer-data-[state=expanded]:md:ml-[var(--sidebar-width)] transition-[margin-left] duration-300 ease-in-out">
             <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
               <Link href="/app/dashboard" className="flex items-center gap-2 font-semibold">
                  <IncepticoLogo className="h-8 w-8 text-primary" />
                  <span className="font-headline text-xl text-glow-accent">Inceptico</span>
                </Link>
              <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="sm:hidden border-primary/50 text-primary hover:bg-primary/10">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground border-sidebar-border shadow-xl p-0">
                   <div className="h-20 flex items-center px-4 border-b border-sidebar-border mb-4">
                    <Link href="/app/dashboard" onClick={closeMobileSheet} className="flex items-center gap-2.5 font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors">
                      <IncepticoLogo className="h-10 w-10 text-primary" />
                      <span className="font-headline text-2xl text-glow-accent">Inceptico</span>
                    </Link>
                  </div>
                  <div className="p-2">
                    <MobileSidebarNav onLinkClick={closeMobileSheet} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-sidebar-border">
                    <UserProfileFooter />
                  </div>
                </SheetContent>
              </Sheet>
            </header>
            <SidebarInset className="p-4 sm:px-6 sm:py-0">
              <main className="flex-1 overflow-auto py-6">
                {children}
              </main>
            </SidebarInset>
          </div>
        </div>
        <DynamicGuidanceSystem /> 
        <SurpriseEventModal />
      </SidebarProvider>
    </TooltipProvider>
  );
}

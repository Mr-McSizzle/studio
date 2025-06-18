
"use client"; 

import type { ReactNode } from "react";
import Link from "next/link";
import { PanelLeft, LogOut, Settings, Home } from "lucide-react"; // Added Home
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; 

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore"; 
import { DynamicGuidanceSystem } from "@/components/guidance/DynamicGuidanceSystem";

function UserProfileDropdown() {
  const router = useRouter();
  const { userName, userEmail, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout(); 
    router.push('/login');
  };

  const handleProfile = () => {
    router.push('/app/profile');
  };

  const handleLaunchpad = () => {
    router.push('/app/launchpad');
  };

  if (!userName && !userEmail) return null;

  return (
    <div className="group relative">
      <button className="flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent/10 transition-colors w-full text-left">
        <Avatar className="h-8 w-8 border-2 border-sidebar-accent">
          <AvatarImage src={`https://placehold.co/40x40.png?text=${userName ? userName.charAt(0).toUpperCase() : 'F'}`} alt={userName || "Founder"} data-ai-hint="letter avatar"/>
          <AvatarFallback>{userName ? userName.charAt(0).toUpperCase() : "F"}</AvatarFallback>
        </Avatar>
        <div className="text-sm group-data-[sidebar-state=collapsed]:hidden">
          <p className="font-semibold text-sidebar-foreground truncate max-w-[100px]">{userName || "Founder"}</p>
          <p className="text-xs text-sidebar-foreground/70 truncate max-w-[100px]">{userEmail || "No email"}</p>
        </div>
      </button>
      <div className="absolute bottom-full mb-2 left-0 w-full min-w-[180px] bg-sidebar border border-sidebar-border rounded-md shadow-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto group-data-[sidebar-state=collapsed]:left-full group-data-[sidebar-state=collapsed]:bottom-auto group-data-[sidebar-state=collapsed]:top-0 group-data-[sidebar-state=collapsed]:ml-2">
        <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLaunchpad}>
          <Home className="mr-2 h-4 w-4"/> Launchpad
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleProfile}>
          <Settings className="mr-2 h-4 w-4"/> Profile
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4"/> Logout
        </Button>
      </div>
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

    if (pathname.startsWith('/app') && !pathname.startsWith('/app/login') && !pathname.startsWith('/app/signup')) {
      if (!isAuthenticated) {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, userEmail, router, pathname]);


  const closeMobileSheet = () => setIsMobileSheetOpen(false);
  
  if (userEmail === undefined) { 
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <ForgeSimLogo className="h-20 w-20 text-primary animate-subtle-pulse mb-4"/>
            <p className="text-lg text-glow-primary">Initializing Secure Session...</p>
        </div>
    );
  }

  if (!isAuthenticated && pathname.startsWith('/app') && !pathname.startsWith('/app/login') && !pathname.startsWith('/app/signup')) { 
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <ForgeSimLogo className="h-20 w-20 text-primary animate-subtle-pulse mb-4"/>
            <p className="text-lg text-glow-primary">Redirecting to Secure Access Point...</p>
        </div>
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
              <Link href="/app/launchpad" className="flex items-center gap-2.5 font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors">
                <ForgeSimLogo className="h-10 w-10 text-primary group-hover:text-accent transition-colors duration-300" />
                <span className="font-headline text-2xl text-glow-accent group-data-[sidebar-state=collapsed]:hidden">ForgeSim</span>
              </Link>
              <div className="hidden md:block group-data-[sidebar-state=expanded]:opacity-100 group-data-[sidebar-state=collapsed]:opacity-0 transition-opacity">
                <SidebarToggleButton/>
              </div>
            </SidebarHeader>
            <SidebarContent className="flex flex-col p-2 flex-grow">
              <SidebarNav />
            </SidebarContent>
            <SidebarFooter className="p-2 border-t border-sidebar-border">
              <UserProfileDropdown />
            </SidebarFooter>
          </Sidebar>

          <div className="flex flex-col sm:gap-4 sm:py-4 md:ml-[var(--sidebar-width-icon)] peer-data-[state=expanded]:md:ml-[var(--sidebar-width)] transition-[margin-left] duration-300 ease-in-out">
             <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
               <Link href="/app/launchpad" className="flex items-center gap-2 font-semibold">
                  <ForgeSimLogo className="h-8 w-8 text-primary" />
                  <span className="font-headline text-xl text-glow-accent">ForgeSim</span>
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
                    <Link href="/app/launchpad" onClick={closeMobileSheet} className="flex items-center gap-2.5 font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors">
                      <ForgeSimLogo className="h-10 w-10 text-primary" />
                      <span className="font-headline text-2xl text-glow-accent">ForgeSim</span>
                    </Link>
                  </div>
                  <div className="p-2">
                    <MobileSidebarNav onLinkClick={closeMobileSheet} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-sidebar-border">
                    <UserProfileDropdown />
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
      </SidebarProvider>
    </TooltipProvider>
  );
}
    

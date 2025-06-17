"use client"; 

import type { ReactNode } from "react";
import Link from "next/link";
import { PanelLeft, LogOut, Settings } from "lucide-react"; 
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; 

import { ForgeSimLogo } from "@/components/icons/logo";
import { SidebarNav, MobileSidebarNav, SidebarToggleButton } from "@/components/layout/sidebar-nav";
import { GamifiedHeader } from "@/components/layout/gamified-header";
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
import { Badge } from "@/components/ui/badge";
import { useAiMentorStore } from "@/store/aiMentorStore"; 
import { useAuthStore } from "@/store/authStore"; 
import { DynamicGuidanceSystem } from "@/components/guidance/DynamicGuidanceSystem";

function UserProfileDropdown() {
  const router = useRouter();
  const { userName, userEmail, logout } = useAuthStore();
  const { clearChatHistory } = useAiMentorStore(); 
  
  const handleLogout = () => {
    logout(); 
    router.push('/login');
  };

  const handleProfile = () => {
    router.push('/app/profile');
  };

  if (!userName && !userEmail) return null;

  return (
    <div className="group relative">
      <button className="flex items-center gap-2 p-3 rounded-lg hover:bg-gradient-to-r hover:from-sidebar-accent/10 hover:to-accent/10 transition-all duration-200 w-full text-left border border-transparent hover:border-accent/20">
        <Avatar className="h-10 w-10 border-2 border-accent shadow-lg">
          <AvatarImage src={`https://placehold.co/40x40.png?text=${userName ? userName.charAt(0).toUpperCase() : 'F'}`} alt={userName || "Founder"} data-ai-hint="letter avatar"/>
          <AvatarFallback className="bg-gradient-to-br from-accent to-yellow-400 text-black font-bold">
            {userName ? userName.charAt(0).toUpperCase() : "F"}
          </AvatarFallback>
        </Avatar>
        <div className="text-sm group-data-[sidebar-state=collapsed]:hidden">
          <p className="font-semibold text-sidebar-foreground truncate max-w-[100px] flex items-center gap-1">
            {userName || "Founder"}
            <Badge variant="level" className="text-xs">
              Pro
            </Badge>
          </p>
          <p className="text-xs text-sidebar-foreground/70 truncate max-w-[100px]">{userEmail || "No email"}</p>
        </div>
      </button>
      <div className="absolute bottom-full mb-2 left-0 w-full min-w-[200px] bg-sidebar border border-sidebar-border rounded-lg shadow-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto group-data-[sidebar-state=collapsed]:left-full group-data-[sidebar-state=collapsed]:bottom-auto group-data-[sidebar-state=collapsed]:top-0 group-data-[sidebar-state=collapsed]:ml-2">
        <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleProfile}>
          <Settings className="mr-2 h-4 w-4"/> Player Profile
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

    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, userEmail, router]);

  const closeMobileSheet = () => setIsMobileSheetOpen(false);
  
  if (!isAuthenticated && userEmail !== undefined) { 
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <ForgeSimLogo className="h-20 w-20 text-primary animate-subtle-pulse mb-4"/>
            <p className="text-lg text-glow-primary">Accessing Simulation Matrix...</p>
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
            className="border-r bg-gradient-to-b from-sidebar via-sidebar to-sidebar/90 text-sidebar-foreground shadow-2xl border-accent/20"
          >
            <SidebarHeader className="h-20 flex items-center justify-between px-4 border-b border-accent/20 bg-gradient-to-r from-transparent to-accent/5">
              <Link href="/app/dashboard" className="flex items-center gap-2.5 font-semibold text-sidebar-foreground hover:text-accent transition-colors group">
                <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-yellow-400 shadow-lg group-hover:shadow-accent-glow-sm transition-all duration-200">
                  <ForgeSimLogo className="h-8 w-8 text-black" />
                </div>
                <div className="group-data-[sidebar-state=collapsed]:hidden">
                  <span className="font-headline text-xl text-glow-accent">ForgeSim</span>
                  <Badge variant="xp" className="ml-2 text-xs">
                    BETA
                  </Badge>
                </div>
              </Link>
              <div className="hidden md:block group-data-[sidebar-state=expanded]:opacity-100 group-data-[sidebar-state=collapsed]:opacity-0 transition-opacity">
                <SidebarToggleButton/>
              </div>
            </SidebarHeader>
            <SidebarContent className="flex flex-col p-2 flex-grow">
              <SidebarNav />
            </SidebarContent>
            <SidebarFooter className="p-2 border-t border-accent/20 bg-gradient-to-r from-transparent to-accent/5">
              <UserProfileDropdown />
            </SidebarFooter>
          </Sidebar>

          <div className="flex flex-col sm:gap-4 sm:py-4 md:ml-[var(--sidebar-width-icon)] peer-data-[state=expanded]:md:ml-[var(--sidebar-width)] transition-[margin-left] duration-300 ease-in-out">
            {/* Gamified Header */}
            <GamifiedHeader />
            
             <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
               <Link href="/app/dashboard" className="flex items-center gap-2 font-semibold">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-accent to-yellow-400">
                    <ForgeSimLogo className="h-6 w-6 text-black" />
                  </div>
                  <span className="font-headline text-lg text-glow-accent">ForgeSim</span>
                </Link>
              <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="sm:hidden border-accent/50 text-accent hover:bg-accent/10">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs bg-gradient-to-b from-sidebar to-sidebar/90 text-sidebar-foreground border-accent/20 shadow-xl p-0">
                   <div className="h-20 flex items-center px-4 border-b border-accent/20 mb-4 bg-gradient-to-r from-transparent to-accent/5">
                    <Link href="/app/dashboard" onClick={closeMobileSheet} className="flex items-center gap-2.5 font-semibold text-sidebar-foreground hover:text-accent transition-colors">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-yellow-400 shadow-lg">
                        <ForgeSimLogo className="h-8 w-8 text-black" />
                      </div>
                      <span className="font-headline text-xl text-glow-accent">ForgeSim</span>
                    </Link>
                  </div>
                  <div className="p-2">
                    <MobileSidebarNav onLinkClick={closeMobileSheet} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-accent/20 bg-gradient-to-r from-transparent to-accent/5">
                    <UserProfileDropdown />
                  </div>
                </SheetContent>
              </Sheet>
            </header>
            <SidebarInset className="p-4 sm:px-6 sm:py-0">
              <main className="flex-1 overflow-auto">
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
import type { ReactNode } from "react";
import Link from "next/link";
import { PanelLeft } from "lucide-react";

import { IncepticoLogo } from "@/components/icons/logo";
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

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r bg-sidebar text-sidebar-foreground">
            <SidebarHeader className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
              <Link href="/app/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-foreground hover:text-sidebar-accent transition-colors">
                <IncepticoLogo className="h-7 w-7" />
                <span className="font-headline text-lg">Inceptico</span>
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

          <div className="flex flex-col sm:gap-4 sm:py-4 md:ml-[var(--sidebar-width-icon)] group-data-[state=expanded]:md:ml-[var(--sidebar-width)] transition-[margin-left] duration-200 ease-linear">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground border-sidebar-border">
                   <div className="h-16 flex items-center px-4 border-b border-sidebar-border mb-4">
                    <Link href="/app/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-foreground hover:text-sidebar-accent transition-colors">
                      <IncepticoLogo className="h-7 w-7" />
                      <span className="font-headline text-lg">Inceptico</span>
                    </Link>
                  </div>
                  <MobileSidebarNav />
                </SheetContent>
              </Sheet>
              {/* Mobile Header Right Content, e.g. User Menu */}
            </header>
            <SidebarInset className="p-4 sm:px-6 sm:py-0">
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

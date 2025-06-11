
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Lightbulb,
  Box,
  Trophy,
  PanelLeft,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";


const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/mentor", label: "AI Mentor", icon: MessageSquare },
  { href: "/app/strategy", label: "Strategy", icon: Lightbulb },
  { href: "/app/simulation", label: "Simulation", icon: Box },
  { href: "/app/gamification", label: "Gamification", icon: Trophy },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/app");
        
        return (
          <SidebarMenuItem key={item.label}>
             <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  asChild
                  variant="default"
                  size="default"
                  className={cn(
                    "w-full justify-start",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
                  )}
                  isActive={isActive}
                >
                  <Link href={item.href}>
                    <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 group-hover/menu-button:text-sidebar-accent-foreground")} />
                    <span className={cn(state === "collapsed" && !isMobile && "hidden")}>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </TooltipTrigger>
              {state === "collapsed" && !isMobile && (
                <TooltipContent side="right" className="bg-popover text-popover-foreground">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function MobileSidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
     <nav className="grid gap-2 text-lg font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/app");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                isActive ? "bg-muted text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
  );
}


export function SidebarToggleButton() {
  const { toggleSidebar, isMobile } = useSidebar();
  if (isMobile) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <PanelLeft className="h-5 w-5" />
    </Button>
  );
}

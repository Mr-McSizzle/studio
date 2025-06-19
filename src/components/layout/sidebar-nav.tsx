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
  UserIcon, 
  Beaker, 
  Users, 
  ListTodo,
  Star,
  Zap,
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
import { Badge } from "@/components/ui/badge";
import { useSimulationStore } from "@/store/simulationStore";

const navItems = [
  { href: "/app/dashboard", label: "Command Center", icon: LayoutDashboard, xpReward: 5 },
  { href: "/app/agents", label: "AI Squad", icon: Users, xpReward: 3 }, 
  { href: "/app/mentor", label: "EVE Assistant", icon: MessageSquare, xpReward: 5 },
  { href: "/app/simulation", label: "Control Room", icon: Box, xpReward: 8 },
  { href: "/app/strategy", label: "War Room", icon: Lightbulb, xpReward: 10 },
  { href: "/app/lab", label: "Innovation Lab", icon: Beaker, xpReward: 15 },
  { href: "/app/gamification", label: "Achievement Hub", icon: Trophy, xpReward: 5 },
  { href: "/app/todo", label: "Quest Log", icon: ListTodo, xpReward: 3 },
  { href: "/app/profile", label: "Player Profile", icon: UserIcon, xpReward: 2 },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const { isInitialized, startupScore } = useSimulationStore();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/app" && item.href.length > "/app".length);
        
        return (
          <SidebarMenuItem key={item.label}>
            <Tooltip>
              <TooltipTrigger asChild>
                 <SidebarMenuButton
                  asChild
                  variant="default"
                  size="default"
                  className={cn(
                    "w-full justify-start relative group",
                    isActive && "bg-gradient-to-r from-sidebar-accent to-accent/80 text-sidebar-accent-foreground hover:from-sidebar-accent/90 hover:to-accent/70"
                  )}
                  isActive={isActive}
                >
                  <Link href={item.href} className="flex items-center gap-3 w-full">
                    <div className={cn(
                      "p-1.5 rounded-md transition-all duration-200",
                      isActive 
                        ? "bg-white/20 shadow-lg" 
                        : "group-hover:bg-sidebar-accent/20"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4 shrink-0 transition-all duration-200", 
                        isActive 
                          ? "text-white drop-shadow-sm" 
                          : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                      )} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className={cn(
                        "font-medium transition-all duration-200",
                        state === "collapsed" && !isMobile && "hidden",
                        isActive ? "text-white" : ""
                      )}>
                        {item.label}
                      </span>
                      {!isActive && !(state === "collapsed" && !isMobile) && (
                        <Badge variant="xp" className="text-xs mt-0.5 opacity-70">
                          +{item.xpReward} XP
                        </Badge>
                      )}
                    </div>
                    {isActive && (
                      <div className="absolute right-2">
                        <Star className="h-3 w-3 text-yellow-300 fill-yellow-300 animate-pulse" />
                      </div>
                    )}
                  </Link>
                </SidebarMenuButton>
              </TooltipTrigger>
              {(state === "collapsed" || isMobile) && (
                <TooltipContent side="right" className="bg-popover text-popover-foreground">
                  <div className="flex flex-col items-center">
                    <span>{item.label}</span>
                    <Badge variant="xp" className="text-xs mt-1">
                      +{item.xpReward} XP
                    </Badge>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </SidebarMenuItem>
        );
      })}
      
      {/* Startup Score Display in Sidebar */}
      {isInitialized && !(state === "collapsed" && !isMobile) && (
        <div className="mt-4 p-3 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Startup Power</span>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="level" className="text-sm">
              {startupScore}/100
            </Badge>
            <div className="text-xs text-muted-foreground">
              {startupScore >= 80 ? "🔥 Elite" : startupScore >= 60 ? "⚡ Strong" : startupScore >= 40 ? "📈 Growing" : "🌱 Starting"}
            </div>
          </div>
        </div>
      )}
    </SidebarMenu>
  );
}

export function MobileSidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
     <nav className="grid gap-2 text-lg font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/app" && item.href.length > "/app".length);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick} 
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary relative",
                isActive ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <div className="flex flex-col">
                <span>{item.label}</span>
                <Badge variant="xp" className="text-xs w-fit">
                  +{item.xpReward} XP
                </Badge>
              </div>
              {isActive && (
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-auto" />
              )}
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
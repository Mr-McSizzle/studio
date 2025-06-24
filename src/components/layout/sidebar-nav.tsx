
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
  Rocket,
  User as UserIcon, 
  Beaker, 
  Users, 
  ListTodo, 
  TrendingUp,
  FlaskConical,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";


const preLaunchNavItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/setup", label: "Setup Simulation", icon: Rocket },
  { href: "/app/agents", label: "AI Agent Team", icon: Users }, 
  { href: "/app/mentor", label: "Hive Mind Assistant", icon: MessageSquare },
  { href: "/app/simulation", label: "Decision Controls", icon: Box },
  { href: "/app/strategy", label: "Strategy & Analytics", icon: Lightbulb },
  { href: "/app/lab", label: "Innovation Lab", icon: Beaker },
  { href: "/app/gamification", label: "Milestones & Score", icon: Trophy },
  { href: "/app/todo", label: "Todo List", icon: ListTodo }, 
];

const postLaunchNavItems = [
    { href: "/app/post-launch/dashboard", label: "Quarterly Dashboard", icon: TrendingUp },
    { href: "/app/post-launch/mentor", label: "Growth Hive Mind", icon: MessageSquare },
    { href: "/app/post-launch/agents", label: "Growth AI Team", icon: Users },
    { href: "/app/post-launch/innovation", label: "Innovation Hub", icon: FlaskConical },
    { href: "/app/post-launch/todo", label: "Quarterly Objectives", icon: ListTodo },
    { href: "/app/post-launch/gamification", label: "Growth Milestones", icon: Trophy },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();

  const renderMenuItem = (item: typeof preLaunchNavItems[0]) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== "/app");
    
    return (
      <SidebarMenuItem key={item.label}>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
             <SidebarMenuButton
              asChild
              variant="default"
              size="default"
              className={cn(
                "w-full justify-start group/menu-button", 
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90 shadow-accent-glow-sm",
                  !isActive && "hover:shadow-accent-glow-sm" 
              )}
              isActive={isActive}
            >
              <Link href={item.href}>
                <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200 group-hover/menu-button:scale-110", isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 group-hover/menu-button:text-sidebar-accent-foreground")} />
                <span className={cn(state === "collapsed" && !isMobile && "hidden")}>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          {(state === "collapsed" || isMobile) && (
            <TooltipContent side="right" className="bg-popover text-popover-foreground border-accent/50 shadow-lg">
              {item.label}
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarMenuItem>
    );
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Pre-Launch</SidebarGroupLabel>
        <SidebarMenu>
          {preLaunchNavItems.map(renderMenuItem)}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarSeparator />
      <SidebarGroup>
        <SidebarGroupLabel>Post-Launch</SidebarGroupLabel>
        <SidebarMenu>
          {postLaunchNavItems.map(renderMenuItem)}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}

export function MobileSidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  const renderMobileMenuItem = (item: typeof preLaunchNavItems[0]) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== "/app");
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onLinkClick} 
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary hover:bg-muted", 
          isActive ? "bg-muted text-primary" : "text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        {item.label}
      </Link>
    );
  };

  return (
     <nav className="grid gap-2 text-lg font-medium">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pre-Launch</p>
        {preLaunchNavItems.map(renderMobileMenuItem)}
        <Separator className="my-2" />
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Post-Launch</p>
        {postLaunchNavItems.map(renderMobileMenuItem)}
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
    

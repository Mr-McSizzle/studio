"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { User, Settings, Swords, Trophy, ChevronRight } from "lucide-react";

// Dynamically import the GalaxyCanvas component with SSR disabled
const GalaxyCanvasComponent = dynamic(
  () => import("@/components/launchpad/GalaxyCanvas").then(mod => mod.GalaxyCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
        <p className="text-white text-xl animate-pulse">Loading Galaxy...</p>
      </div>
    ),
  }
);

export default function LaunchpadPage() {
  const navigationItems = [
    {
      title: "Founder's Profile",
      description: "Craft your cosmic identity",
      icon: User,
      href: "/app/profile",
      disabled: false,
    },
    {
      title: "Setup Simulation",
      description: "Design your universe",
      icon: Settings,
      href: "/app/setup",
      disabled: false,
    },
    {
      title: "Clash of Sims",
      description: "Battle across dimensions (Coming Soon)",
      icon: Swords,
      href: "/app/launchpad", // Placeholder, or a dedicated coming soon page
      disabled: true,
    },
    {
      title: "Milestones & Score",
      description: "Unlock cosmic rewards",
      icon: Trophy,
      href: "/app/gamification",
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden font-inter">
      <div className="absolute inset-0 z-0">
        <GalaxyCanvasComponent />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-indigo-950/30 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-transparent to-indigo-950/20 z-10" />

      <div className="relative z-20 min-h-screen flex flex-col">
        <header className="p-6 pt-16">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-1 h-10 bg-gradient-to-b from-transparent via-indigo-400/60 to-transparent mr-6" />
              <h1 className="text-6xl md:text-7xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-white to-slate-200 tracking-[-0.03em] leading-[0.9]">
                ForgeSim Launchpad
              </h1>
              <div className="w-1 h-10 bg-gradient-to-b from-transparent via-purple-400/60 to-transparent ml-6" />
            </div>
            <p className="text-lg md:text-xl text-slate-300/90 font-normal max-w-2xl mx-auto leading-relaxed tracking-[0.01em]">
              Gateway to your ForgeSim experience. Choose your path.
            </p>
            <div className="flex items-center justify-center mt-8 space-x-3">
              <div className="w-1.5 h-1.5 bg-indigo-400/70 rounded-full animate-pulse" />
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent" />
              <div className="w-1.5 h-1.5 bg-purple-400/70 rounded-full animate-pulse delay-500" />
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isComingSoon = item.disabled;

                return (
                  <div
                    key={item.title}
                    className="group relative"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {isComingSoon ? (
                      <div className="opacity-60 cursor-not-allowed">
                        <CardContent item={item} Icon={Icon} isComingSoon />
                      </div>
                    ) : (
                      <Link href={item.href}>
                        <CardContent item={item} Icon={Icon} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <footer className="p-6 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-8 text-slate-400/70 text-xs font-normal tracking-[0.08em] uppercase">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-emerald-400/80 rounded-full animate-pulse shadow-md shadow-emerald-400/30" />
                <span>System Online</span>
              </div>
              <div className="w-px h-4 bg-slate-600/50" />
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-indigo-400/80 rounded-full animate-pulse shadow-md shadow-indigo-400/30" />
                <span>Ready</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// This internal component structure remains the same, just ensure the page using dynamic import is client-side.
function CardContent({ item, Icon, isComingSoon = false }: { item: any; Icon: any; isComingSoon?: boolean }) {
  return (
    <div
      className={`relative backdrop-blur-2xl bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 transition-all duration-700 hover:scale-[1.02] hover:border-white/[0.15] hover:bg-white/[0.04] overflow-hidden group-hover:shadow-xl group-hover:shadow-indigo-500/[0.05] ${
        isComingSoon ? "" : "cursor-pointer" // Only add cursor-pointer if not disabled
      }`}
    >
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />
      <div className="relative z-10">
        <div className="mb-6 flex justify-center">
          <div className="relative w-20 h-20 group-hover:scale-105 transition-all duration-700">
            <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.06] border border-white/[0.12] rounded-xl shadow-xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-10 h-10 text-slate-200/90 group-hover:text-white transition-colors duration-500 drop-shadow-xl" />
            </div>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl md:text-2xl font-medium text-white/95 mb-3 group-hover:text-white transition-colors duration-500 tracking-[-0.01em]">
            {item.title}
          </h3>
          <p className="text-slate-300/80 text-base mb-6 group-hover:text-slate-200/90 transition-colors duration-500 font-normal leading-relaxed tracking-[0.005em]">
            {item.description}
          </p>
          {!isComingSoon ? (
            <div className="flex items-center justify-center text-slate-400/80 group-hover:text-slate-200 transition-all duration-500">
              <span className="mr-3 font-normal tracking-[0.1em] text-xs uppercase">Enter</span>
              <div className="relative">
                <div className="backdrop-blur-sm bg-white/[0.04] border border-white/[0.08] rounded-full p-1.5 group-hover:bg-white/[0.08] group-hover:border-white/[0.15] transition-all duration-500">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-500" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-purple-400/80 font-semibold tracking-wider group-hover:text-purple-300 transition-colors">
              (COMING SOON)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useState } from 'react'; 
import Link from 'next/link';
import { ChevronRight, ClipboardList, TrendingUp, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button'; 
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const preLaunchItem = {
  title: "Pre-Launch Simulation",
  description: "Where raw ideas are forged into startups. Define your venture and create its digital twin.",
  icon: ClipboardList,
  href: "/app/setup",
};

const postLaunchItem = {
    title: "Post-Launch Simulation",
    description: "Navigate growth, innovation, and survival after launch.",
    icon: TrendingUp,
    href: "/app/post-launch/setup",
};

const CardUiComponent = ({ item, isLocked = false }: { item: typeof preLaunchItem, isLocked?: boolean }) => {
    const Icon = item.icon;
    return (
        <>
            <div className="absolute inset-0 rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-white/[0.01] rounded-2xl" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                <div className="absolute inset-2 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-purple-500/[0.02] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)] rounded-2xl" />
            </div>
            <div className="relative z-10">
                <div className="mb-6 flex justify-center">
                    <div className="relative w-20 h-20 group-hover:scale-105 transition-all duration-700">
                        <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.06] border border-white/[0.12] rounded-xl shadow-xl">
                            <div className="absolute inset-1 bg-gradient-to-br from-white/[0.08] to-transparent rounded-lg" />
                            <div className="absolute top-2 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            <div className="absolute top-2 bottom-2 left-2 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                            <div className="absolute inset-1.5 bg-gradient-to-br from-indigo-400/[0.03] to-purple-400/[0.03] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           {isLocked ? (
                                <Lock className="w-10 h-10 text-slate-400/70 drop-shadow-xl" />
                            ) : (
                                <Icon className="w-10 h-10 text-slate-200/90 group-hover:text-white transition-colors duration-500 drop-shadow-xl" />
                            )}
                        </div>
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 backdrop-blur-sm bg-indigo-400/20 border border-indigo-400/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 backdrop-blur-sm bg-purple-400/20 border border-purple-400/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity animation-delay-[0.2s] duration-500" />
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-4xl md:text-5xl font-jim-nightshade text-white/95 mb-3 group-hover:text-white transition-colors duration-500">
                      {item.title}
                    </h3>
                    <p className="text-slate-300/80 text-base mb-6 group-hover:text-slate-200/90 transition-colors duration-500 font-normal leading-relaxed tracking-[0.005em]">
                      {isLocked ? "Unlock this premium simulation module to continue your journey." : item.description}
                    </p>
                    <div className="flex items-center justify-center text-slate-400/80 group-hover:text-slate-200 transition-all duration-500">
                      <span className="mr-3 font-normal tracking-[0.1em] text-xs uppercase">{isLocked ? "Unlock" : "Enter"}</span>
                        <div className="relative">
                          <div className="backdrop-blur-sm bg-white/[0.04] border border-white/[0.08] rounded-full p-1.5 group-hover:bg-white/[0.08] group-hover:border-white/[0.15] transition-all duration-500">
                             {isLocked ? <Crown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-500" />}
                          </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            </div>
        </>
    );
};

export default function SimulationHubPage() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = () => {
      setIsSubscribed(true);
      toast({
          title: "Subscription Activated!",
          description: "You've unlocked the Post-Launch Simulation module. Welcome to the next stage.",
          duration: 5000,
      });
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          objectFit: 'cover',
        }}
        src="/new-assets/launchpadbg.mp4"
        className="opacity-70"
      >
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-indigo-950/30 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-transparent to-indigo-950/20 z-10" />

      <div className="relative z-20 min-h-screen flex flex-col">
        <header className="p-6 pt-16">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-1 h-10 bg-gradient-to-b from-transparent via-indigo-400/60 to-transparent mr-6" />
              <h1 className="font-jim-nightshade text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-white to-slate-200 tracking-[-0.03em] leading-[0.9]">
               Simulation Hub
              </h1>
              <div className="w-1 h-10 bg-gradient-to-b from-transparent via-purple-400/60 to-transparent ml-6" />
            </div>
            <p className="text-lg md:text-xl text-slate-300/90 font-normal max-w-2xl mx-auto leading-relaxed tracking-[0.01em]">
              Choose your path. Forge a new destiny or continue an existing one.
            </p>
            <div className="flex items-center justify-center mt-8 space-x-3">
              <div className="w-1.5 h-1.5 bg-indigo-400/70 rounded-full animate-pulse" />
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent" />
              <div className="w-1.5 h-1.5 bg-purple-400/70 rounded-full animate-pulse animation-delay-[0.5s]" />
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Pre-Launch Card */}
              <div className="group relative animate-fadeInUp">
                <Link
                    href={preLaunchItem.href}
                    className="block relative backdrop-blur-2xl bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 transition-all duration-700 hover:scale-[1.02] hover:border-white/[0.15] hover:bg-white/[0.04] cursor-pointer overflow-hidden group-hover:shadow-xl group-hover:shadow-indigo-500/[0.05]"
                >
                    <CardUiComponent item={preLaunchItem} />
                </Link>
              </div>

              {/* Post-Launch Card (with paywall logic) */}
              <div className="group relative animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                {isSubscribed ? (
                    <Link
                        href={postLaunchItem.href}
                        className="block relative backdrop-blur-2xl bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 transition-all duration-700 hover:scale-[1.02] hover:border-white/[0.15] hover:bg-white/[0.04] cursor-pointer overflow-hidden group-hover:shadow-xl group-hover:shadow-indigo-500/[0.05]"
                    >
                        <CardUiComponent item={postLaunchItem} />
                    </Link>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                className="block w-full h-full relative backdrop-blur-2xl bg-white/[0.01] border border-white/[0.05] rounded-2xl p-8 text-left overflow-hidden hover:scale-[1.02] hover:border-accent/[0.25] hover:bg-white/[0.03] group-hover:shadow-xl group-hover:shadow-accent/10"
                                aria-label="Unlock Post-Launch Simulation"
                            >
                                <CardUiComponent item={postLaunchItem} isLocked />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2"><Crown className="text-accent" />Unlock Premium Simulation</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You've mastered the pre-launch phase. The Post-Launch Simulation offers advanced challenges, deeper analytics, and competitive scenarios. This is a premium feature.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="p-4 my-2 bg-muted/50 rounded-lg border">
                                <p className="font-bold text-lg text-center">Inceptico Pro</p>
                                <p className="text-center text-sm"><span className="text-3xl font-bold">$19.99</span> / month</p>
                                <ul className="text-xs text-muted-foreground mt-3 space-y-1 list-disc list-inside">
                                    <li>Access Post-Launch Simulation modules</li>
                                    <li>Unlock advanced AI agents</li>
                                    <li>Compete in "Clash of Sims" (coming soon)</li>
                                    <li>Priority access to new features</li>
                                </ul>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Maybe Later</AlertDialogCancel>
                                <AlertDialogAction onClick={handleSubscribe} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                    Subscribe & Unlock
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

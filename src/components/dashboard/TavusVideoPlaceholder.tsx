
"use client";

import { PlayCircle } from 'lucide-react';
import Image from 'next/image';

export const TavusVideoPlaceholder = () => {
  return (
    <div className="relative w-full aspect-video rounded-lg bg-slate-900 overflow-hidden border border-primary/30 group">
      <Image
        src="/new-assets/custom_eve_avatar.png"
        alt="EVE AI Video Agent Background"
        layout="fill"
        objectFit="cover"
        className="opacity-20 blur-sm group-hover:blur-none group-hover:opacity-30 transition-all duration-300"
        data-ai-hint="abstract technology"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <PlayCircle className="w-16 h-16 text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300 drop-shadow-lg" />
        <p className="mt-4 font-semibold text-lg drop-shadow-md">Tavus AI Video Agent</p>
        <p className="text-xs text-white/80 drop-shadow-sm">(Conceptual Implementation)</p>
      </div>
    </div>
  );
};

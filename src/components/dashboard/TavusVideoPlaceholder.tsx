
"use client";

import { useEffect, useState } from 'react';
// import { Tavus } from '@tavus/react'; // Step 1: Uncomment after running `npm install @tavus/react`

interface TavusVideoPlaceholderProps {
  // Pass any dynamic data your video needs as props
  userName?: string;
  companyName?: string;
  kpiValue?: string;
  kpiName?: string;
}

export const TavusVideoPlaceholder = ({
  userName = "Founder",
  companyName = "your startup",
  kpiValue = "10%",
  kpiName = "growth",
}: TavusVideoPlaceholderProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure this component only renders on the client, where the Tavus SDK can run.
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render a simple loading state or null during server-side rendering
    return <div className="relative w-full aspect-video rounded-lg bg-slate-900" />;
  }

  // Step 2: Add your actual Tavus API key to the .env file in your project's root.
  const TAVUS_API_KEY = process.env.NEXT_PUBLIC_TAVUS_API_KEY || 'YOUR_TAVUS_API_KEY';
  
  // Step 3: Replace this with the actual ID of your video from your Tavus dashboard.
  const TAVUS_VIDEO_ID = 'YOUR_VIDEO_ID_HERE';

  return (
    <div className="relative w-full aspect-video rounded-lg bg-slate-900 overflow-hidden border border-primary/30 group">
      {/* 
        This is where you would place the Tavus Player component.
        The `variables` prop should match the variables you set up in your Tavus video template.
      */}
      {/*
      <Tavus.Player
        apiKey={TAVUS_API_KEY}
        videoId={TAVUS_VIDEO_ID}
        variables={{
          user_name: userName,
          company_name: companyName,
          kpi_value: kpiValue,
          kpi_name: kpiName,
        }}
      />
      */}

      {/* --- This is the placeholder content. You can remove it once the Tavus.Player is active. --- */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black">
         <p className="font-semibold text-lg drop-shadow-md">Tavus AI Video Agent</p>
         <p className="text-xs text-white/80 drop-shadow-sm">Replace this placeholder with the</p>
         <code className="text-xs bg-white/10 px-2 py-1 rounded-md mt-1 text-accent">&lt;Tavus.Player /&gt;</code>
         <p className="text-xs text-white/80 drop-shadow-sm mt-1">component from '@tavus/react'</p>
      </div>
       {/* --- End of placeholder content --- */}

    </div>
  );
};

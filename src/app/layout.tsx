
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'ForgeSim - AI Business Simulation',
  description: 'ForgeSim: An innovative AI-powered platform to simulate business operations, empowering startups to test, refine, and perfect their strategies. Create a digital twin of your business for predictive analytics, risk assessment, and personalized guidance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"><head><link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
        {/* Enhanced Nexus Background animations - More subtle for dashboard focus */}
        <div className="nexus-bg-animations">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background opacity-80" /> {/* Even more subtle primary tint */}
          {/* Fewer, slower, more dispersed pulses for less distraction */}
          <div className="absolute top-1/5 left-1/5 w-[40rem] h-[40rem] bg-primary/2 rounded-full blur-3xl animate-[subtle-pulse-orb_12s_ease-in-out_infinite] opacity-20" /> 
          <div className="absolute bottom-1/5 right-1/5 w-[35rem] h-[35rem] bg-accent/2 rounded-full blur-3xl animate-[subtle-pulse-orb_15s_ease-in-out_infinite_2s] opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-secondary/2 rounded-full blur-3xl animate-[subtle-pulse-orb_18s_ease-in-out_infinite_4s] opacity-15" />
        </div>
        <div className="relative z-10"> 
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}

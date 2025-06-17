
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
        {/* Enhanced Nexus Background animations */}
        <div className="nexus-bg-animations">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-background opacity-70" /> {/* Darker, more focused gradient */}
          {/* More subtle, slower, and dispersed pulses */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-[subtle-pulse-orb_8s_ease-in-out_infinite] opacity-40" /> 
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-[subtle-pulse-orb_10s_ease-in-out_infinite_1s] opacity-40" />
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-secondary/3 rounded-full blur-3xl animate-[subtle-pulse-orb_12s_ease-in-out_infinite_2s] opacity-30" />
        </div>
        <div className="relative z-10"> 
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}

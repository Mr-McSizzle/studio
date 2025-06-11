
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
    <html lang="en" className="dark"> {/* Ensure dark class is on html */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Using Inter as specified in the prompt for body and headline */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
        {/* Optional: Animated background elements container, similar to NEXUS */}
        <div className="nexus-bg-animations">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse animation-delay-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse animation-delay-1000" />
          {/* Add more subtle geometric shapes if desired */}
        </div>
        <div className="relative z-10"> {/* Content wrapper */}
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}

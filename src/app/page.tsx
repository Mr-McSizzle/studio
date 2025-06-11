
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ForgeSimLogo } from '@/components/icons/logo';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-card p-6 text-center">
      <div className="bg-card/80 backdrop-blur-md p-8 sm:p-12 rounded-xl shadow-2xl max-w-md w-full">
        <ForgeSimLogo className="h-20 w-20 mx-auto mb-6 text-primary" />
        <h1 className="text-4xl sm:text-5xl font-headline font-bold mb-4 text-foreground">
          Welcome to ForgeSim
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Your interactive startup simulation. Build, manage, and grow your virtual company.
        </p>
        <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 rounded-lg shadow-md transition-transform hover:scale-105 focus:ring-4 focus:ring-accent/50">
          <Link href="/app/dashboard">Start Simulating</Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-8">
          Click "Start Simulating" to enter your dashboard and begin your journey.
        </p>
      </div>
    </div>
  );
}

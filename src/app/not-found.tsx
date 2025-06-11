
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center">
      <AlertTriangle className="h-20 w-20 text-destructive mb-8" />
      <h1 className="text-5xl font-headline font-bold mb-4 text-foreground">
        404 - Page Not Found
      </h1>
      <p className="text-xl text-muted-foreground mb-10 max-w-lg">
        Oops! The page you are looking for does not exist. It might have been moved, deleted, or you might have mistyped the URL.
      </p>
      <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
        <Link href="/app/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}

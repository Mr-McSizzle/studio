
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, ensureDefaultUser } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ForgeSimLogo } from '@/components/icons/logo';
import { Mail, Lock, LogInIcon, Home } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const NexusBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    {/* Using theme variables for primary and accent which are now blue and silver */}
    <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-background opacity-90" />
    <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl animate-pulse animation-delay-none" />
    <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/5 rounded-full blur-3xl animate-pulse animation-delay-[1s]" />
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const { toast } = useToast();

  useEffect(() => {
    ensureDefaultUser();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      toast({ title: "Credentials Required", description: "Please enter both email and password.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const loginSuccess = login(email, password);

    if (loginSuccess) {
      toast({ title: "Login Successful", description: `Access granted! Charting course for ForgeSim...`, duration: 3000 });
      router.push('/app');
    } else {
      toast({ title: "Login Failed", description: "Invalid email or password. Please try again.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <NexusBackground />
      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-card/80 backdrop-blur-lg border border-primary/30 shadow-primary-glow-md animate-fadeInUp">
          <CardHeader className="text-center pt-8 pb-6">
            <Link href="/" className="flex justify-center mb-6 group">
              {/* Logo uses theme colors, so it will adapt */}
              <ForgeSimLogo className="h-20 w-20 text-primary group-hover:text-accent transition-colors duration-300 animate-subtle-pulse" />
            </Link>
            <CardTitle className="text-3xl font-headline text-glow-primary">
              Welcome Back, Founder
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Log in to your ForgeSim Digital Twin.
              <br />
              <span className="text-xs">(Test with: founder@forgesim.ai / password123)</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center text-muted-foreground font-semibold">
                  <Mail className="h-5 w-5 mr-2 text-accent" /> {/* Accent is now silver */} Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@forgesim.ai"
                  required
                  disabled={isLoading}
                  className="bg-input/70 border-border focus:bg-input focus:border-accent placeholder:text-muted-foreground/60 py-3 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center text-muted-foreground font-semibold">
                  <Lock className="h-5 w-5 mr-2 text-accent" /> {/* Accent is now silver */} Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isLoading}
                  className="bg-input/70 border-border focus:bg-input focus:border-accent placeholder:text-muted-foreground/60 py-3 text-base"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-primary-foreground text-lg py-6 shadow-md hover:shadow-accent-glow-sm transition-all duration-300 transform hover:scale-105" /* Primary is deep blue, accent for glow is silver */
              >
                {isLoading ? "Authenticating..." : <><LogInIcon className="mr-2 h-5 w-5"/>Secure Login</>}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center text-center pb-8 pt-4">
            <p className="text-sm text-muted-foreground">
              New to ForgeSim?{' '}
              <Button variant="link" asChild className="text-accent hover:text-accent/80 p-0 h-auto font-semibold text-glow-accent"> {/* Accent is silver */}
                <Link href="/signup">Create Your Account</Link>
              </Button>
            </p>
            <Button variant="link" asChild className="text-xs text-muted-foreground/70 hover:text-muted-foreground p-0 h-auto mt-4">
                <Link href="/"><span><Home className="mr-1 h-3 w-3 inline-block align-middle"/>Back to ForgeSim Home</span></Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

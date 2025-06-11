
"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ForgeSimLogo } from '@/components/icons/logo';
import { User, Mail, Lock, Sparkles, Home } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const NexusBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-background opacity-90" />
    <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl animate-pulse animation-delay-none" />
    <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/5 rounded-full blur-3xl animate-pulse animation-delay-[1s]" />
  </div>
);

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({ title: "All fields required", description: "Please provide your name, email, and choose a password.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password Too Short", description: "Password must be at least 8 characters long.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const signUpSuccess = signUp(name, email, password);

    if (signUpSuccess) {
      toast({ title: "Account Creation Initiated!", description: "Welcome to ForgeSim, Founder! Please proceed to login with your new credentials.", duration: 4000 });
      router.push('/login'); 
    } else {
      toast({ title: "Sign-Up Failed", description: "This email may already be registered. Please try a different email or log in.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <NexusBackground />
      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-card/80 backdrop-blur-lg border border-accent/30 shadow-accent-glow-md animate-fadeInUp">
          <CardHeader className="text-center pt-8 pb-6">
            <Link href="/" className="flex justify-center mb-6 group">
              <ForgeSimLogo className="h-20 w-20 text-accent group-hover:text-primary transition-colors duration-300 animate-subtle-pulse" />
            </Link>
            <CardTitle className="text-3xl font-headline text-glow-accent">Join the Forge</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Begin your journey. Create your ForgeSim Founder account.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center text-muted-foreground font-semibold">
                  <User className="h-5 w-5 mr-2 text-primary" /> Founder Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Ada Lovelace"
                  required
                  disabled={isLoading}
                  className="bg-input/70 border-border focus:bg-input focus:border-primary placeholder:text-muted-foreground/60 py-3 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center text-muted-foreground font-semibold">
                  <Mail className="h-5 w-5 mr-2 text-primary" /> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ada.lovelace@forgesim.ai"
                  required
                  disabled={isLoading}
                  className="bg-input/70 border-border focus:bg-input focus:border-primary placeholder:text-muted-foreground/60 py-3 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center text-muted-foreground font-semibold">
                  <Lock className="h-5 w-5 mr-2 text-primary" /> Secure Password (min. 8 characters)
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  required
                  disabled={isLoading}
                  className="bg-input/70 border-border focus:bg-input focus:border-primary placeholder:text-muted-foreground/60 py-3 text-base"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground text-lg py-6 shadow-md hover:shadow-primary-glow-sm transition-all duration-300 transform hover:scale-105"
              >
                 {isLoading ? "Creating Account..." : <><Sparkles className="mr-2 h-5 w-5" />Create Account & Begin</>}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center text-center pb-8 pt-4">
            <p className="text-sm text-muted-foreground">
              Already a Founder?{' '}
              <Button variant="link" asChild className="text-primary hover:text-primary/80 p-0 h-auto font-semibold text-glow-primary">
                <Link href="/login">Log In to Your Simulation</Link>
              </Button>
            </p>
             <Button variant="link" asChild className="text-xs text-muted-foreground/70 hover:text-muted-foreground p-0 h-auto mt-4">
              <Link href="/"><Home className="mr-1 h-3 w-3"/>Back to ForgeSim Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

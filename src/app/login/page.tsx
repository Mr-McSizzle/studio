
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
import { Mail, Lock, LogInIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const { toast } = useToast(); 

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    login(email);
    toast({ title: "Login Successful", description: `Welcome back, ${email.split('@')[0]}!`, duration: 3000 });
    router.push('/app'); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-card p-6">
      <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-lg border-accent/30 animate-fadeIn">
        <CardHeader className="text-center pt-8">
          <Link href="/" className="flex justify-center mb-6">
            <ForgeSimLogo className="h-20 w-20 text-primary animate-subtle-pulse" />
          </Link>
          <CardTitle className="text-3xl font-headline text-glow-gold">Welcome Back to ForgeSim</CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Sign in to continue your business simulation journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center text-muted-foreground font-semibold">
                <Mail className="h-5 w-5 mr-2 text-accent" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@example.com"
                required
                className="bg-input/50 border-border focus:bg-input focus:border-accent placeholder:text-muted-foreground/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center text-muted-foreground font-semibold">
                <Lock className="h-5 w-5 mr-2 text-accent" /> Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-input/50 border-border focus:bg-input focus:border-accent placeholder:text-muted-foreground/70"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <LogInIcon className="mr-2 h-5 w-5"/>
              Log In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-center pb-8">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Button variant="link" asChild className="text-accent hover:text-accent/80 p-0 h-auto font-semibold">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </p>
           <Button variant="link" asChild className="text-xs text-muted-foreground/70 hover:text-muted-foreground p-0 h-auto mt-3">
              <Link href="/">Back to Homepage</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

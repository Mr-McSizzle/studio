
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
import { User, Mail, Lock, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);
  const { toast } = useToast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
     if (!name.trim() || !email.trim() || !password.trim()) {
      toast({ title: "All fields required", description: "Please fill in your name, email, and password.", variant: "destructive" });
      return;
    }
    signUp(name, email); 
    toast({ title: "Sign Up Initiated!", description: "Welcome to ForgeSim! Please log in to begin.", duration: 3000 });
    router.push('/login'); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-card p-6">
      <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-lg border-accent/30 animate-fadeIn">
        <CardHeader className="text-center pt-8">
          <Link href="/" className="flex justify-center mb-6">
            <ForgeSimLogo className="h-20 w-20 text-primary animate-subtle-pulse" />
          </Link>
          <CardTitle className="text-3xl font-headline text-glow-gold">Join ForgeSim</CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Create your account to start building your digital business empire.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center text-muted-foreground font-semibold">
                <User className="h-5 w-5 mr-2 text-accent" /> Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                required
                className="bg-input/50 border-border focus:bg-input focus:border-accent placeholder:text-muted-foreground/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center text-muted-foreground font-semibold">
                <Mail className="h-5 w-5 mr-2 text-accent" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ada.lovelace@example.com"
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
              <Sparkles className="mr-2 h-5 w-5" />
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-center pb-8">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" asChild className="text-accent hover:text-accent/80 p-0 h-auto font-semibold">
              <Link href="/login">Log In</Link>
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

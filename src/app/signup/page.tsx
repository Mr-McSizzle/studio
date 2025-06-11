
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
  const [password, setPassword] = useState(''); // Mock password
  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);
  const { toast } = useToast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
     if (!name.trim() || !email.trim() || !password.trim()) {
      toast({ title: "All fields required", description: "Please fill in your name, email, and password.", variant: "destructive" });
      return;
    }
    signUp(name, email); // Mock sign up
    toast({ title: "Sign Up Initiated!", description: "Welcome to ForgeSim! Please log in to begin."});
    router.push('/login'); // Redirect to login after mock sign up
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-card p-6">
      <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center mb-4">
            <ForgeSimLogo className="h-16 w-16 text-primary" />
          </Link>
          <CardTitle className="text-3xl font-headline text-foreground">Join ForgeSim</CardTitle>
          <CardDescription className="text-muted-foreground">
            Create your account to start building your digital business empire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2" /> Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                required
                className="bg-input/50 border-border focus:bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ada.lovelace@example.com"
                required
                className="bg-input/50 border-border focus:bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center text-muted-foreground">
                <Lock className="h-4 w-4 mr-2" /> Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-input/50 border-border focus:bg-input"
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3">
              <Sparkles className="mr-2 h-5 w-5" />
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" asChild className="text-accent p-0 h-auto">
              <Link href="/login">Log In</Link>
            </Button>
          </p>
          <Button variant="link" asChild className="text-xs text-muted-foreground/70 p-0 h-auto mt-2">
              <Link href="/">Back to Homepage</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

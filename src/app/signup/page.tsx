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
import { User, Mail, Lock, Sparkles, Home, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const NexusBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-background opacity-90" />
    <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl animate-pulse animation-delay-none" />
    <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/5 rounded-full blur-3xl animate-pulse animation-delay-[1s]" />
    
    {/* Animated particles */}
    <div className="absolute top-[10%] left-[15%] w-4 h-4 border border-primary/30 rotate-45 animate-spin" style={{ animationDuration: "20s" }} />
    <div className="absolute top-[30%] right-[20%] w-6 h-6 border border-accent/30 animate-bounce animation-delay-[0.5s]" />
    <div className="absolute bottom-[25%] left-[30%] w-3 h-3 bg-primary/20 rotate-45 animate-pulse animation-delay-[1.5s]" />
    <div className="absolute bottom-[15%] right-[10%] w-8 h-8 border-2 border-accent/20 rounded-full animate-pulse animation-delay-[2s]" />
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

  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 25; // Has uppercase
    if (/[a-z]/.test(password)) strength += 25; // Has lowercase
    if (/[0-9]/.test(password)) strength += 25; // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 25; // Has special char
    
    return Math.min(100, strength);
  };

  const passwordStrength = calculatePasswordStrength(password);
  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-yellow-500";
    if (passwordStrength <= 75) return "bg-blue-500";
    return "bg-green-500";
  };

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
      toast({ 
        title: "🎮 Account Created!", 
        description: (
          <div className="flex flex-col gap-2">
            <p>Welcome to ForgeSim, Founder! Please log in with your new credentials.</p>
            <Badge variant="xp" className="w-fit">+50 XP Earned!</Badge>
          </div>
        ),
        duration: 4000 
      });
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
        <Card className="bg-card/80 backdrop-blur-lg border-2 border-primary/30 shadow-primary-glow-md animate-fadeInUp">
          <CardHeader className="text-center pt-8 pb-6">
            <Link href="/" className="flex justify-center mb-6 group">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-red-400 shadow-lg group-hover:shadow-primary-glow-sm transition-all duration-300">
                <ForgeSimLogo className="h-16 w-16 text-white" />
              </div>
            </Link>
            <CardTitle className="text-3xl font-headline text-glow-primary">Create Your Account</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Begin your journey as a founder in the ForgeSim universe.
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
                  className="bg-input/70 border-primary/30 focus:bg-input focus:border-primary placeholder:text-muted-foreground/60 py-3 text-base"
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
                  className="bg-input/70 border-primary/30 focus:bg-input focus:border-primary placeholder:text-muted-foreground/60 py-3 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center text-muted-foreground font-semibold">
                  <Lock className="h-5 w-5 mr-2 text-primary" /> Secure Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  required
                  disabled={isLoading}
                  className="bg-input/70 border-primary/30 focus:bg-input focus:border-primary placeholder:text-muted-foreground/60 py-3 text-base"
                />
                
                {/* Password strength meter */}
                {password && (
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Password Strength:</span>
                      </div>
                      <span className={passwordStrength > 75 ? "text-green-500" : 
                                      passwordStrength > 50 ? "text-blue-500" : 
                                      passwordStrength > 25 ? "text-yellow-500" : "text-red-500"}>
                        {getPasswordStrengthLabel()}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className="h-1.5" indicatorClassName={getPasswordStrengthColor()} />
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-red-400 hover:from-primary/90 hover:to-red-400/90 text-white font-bold text-lg py-6 shadow-lg hover:shadow-primary-glow-sm transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <span>Begin Your Journey</span>
                  </div>
                )}
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
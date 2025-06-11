
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Settings, History, LogOut, ShieldAlert, Building, Palette } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, userName, userEmail, logout } = useAuthStore();
  const { isInitialized: simIsInitialized, simulationMonth } = useSimulationStore(); // Renamed to avoid conflict

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!simIsInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
        // If authenticated but sim not set up, profile is fine, but other app pages might redirect
        // No specific redirect from profile needed if sim not setup, but good to be aware
    }
  }, [isAuthenticated, simIsInitialized, simulationMonth, router]);

  const handleLogout = () => {
    logout();
    router.push('/login'); // Explicit redirect after logout
  };

  if (!isAuthenticated) {
    // This case should ideally be handled by AppLayout's redirect,
    // but as a fallback or if this page is accessed outside AppLayout somehow.
    return (
       <div className="flex flex-col items-center justify-center min-h-screen">
          <p>Redirecting to login...</p>
       </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
                 <AvatarImage src={`https://placehold.co/80x80.png?text=${userName ? userName.charAt(0).toUpperCase() : 'U'}`} alt={userName || "User"} data-ai-hint="letter avatar" />
                <AvatarFallback>{userName ? userName.charAt(0).toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-headline text-foreground">
                    {userName || "Founder Profile"}
                </h1>
                <p className="text-muted-foreground">{userEmail || "No email set"}</p>
            </div>
        </div>
        <Button onClick={handleLogout} variant="outline" className="bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20">
          <LogOut className="mr-2 h-5 w-5" /> Logout
        </Button>
      </header>
      
       {!simIsInitialized && (
        <Alert variant="default" className="mb-6 bg-secondary/30 border-secondary">
          <Building className="h-4 w-4" />
          <AlertTitle>Simulation Not Yet Initialized</AlertTitle>
          <AlertDescription>
            Your founder profile is active, but your first digital twin simulation hasn&apos;t been set up.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm" variant="outline">Setup Your First Simulation</Button>
          </AlertDescription>
        </Alert>
      )}


      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-accent" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account details and security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start gap-2" disabled>
                <User className="h-4 w-4"/> Update Profile Information
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" disabled>
                <ShieldAlert className="h-4 w-4"/> Change Password
            </Button>
            <p className="text-xs text-muted-foreground text-center pt-2">(User detail editing coming soon)</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Palette className="h-6 w-6 text-accent" />
              ForgeSim Preferences
            </CardTitle>
            <CardDescription>
              Customize your simulation experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground py-10">
            <p>(Options for AI interaction style, notification settings, theme customization, etc., will appear here in a future update.)</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <History className="h-6 w-6 text-accent" />
              Simulation History
            </CardTitle>
            <CardDescription>
              Review past simulation runs and their key outcomes.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground py-10">
            <p>(A list or cards representing past simulations and high-level results will be displayed here, allowing you to revisit them.)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

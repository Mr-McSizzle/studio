
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Settings, History, LogOut, ShieldAlert, Building, Palette, ListRestart, Trash2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, userName, userEmail, logout } = useAuthStore();
  const { 
    isInitialized: simIsInitialized, 
    simulationMonth,
    savedSimulations,
    loadSimulation,
    deleteSavedSimulation,
  } = useSimulationStore();

  const [isLoadingAction, setIsLoadingAction] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login'); 
  };
  
  const handleLoadSnapshot = (snapshotId: string, snapshotName: string) => {
    setIsLoadingAction(true);
    const loadedState = loadSimulation(snapshotId);
    if (loadedState) {
      toast({ title: "Simulation Loaded", description: `Loaded snapshot "${snapshotName}" (Month ${loadedState.simulationMonth}). Redirecting to dashboard.` });
      router.push('/app/dashboard'); 
    } else {
      toast({ title: "Load Failed", description: "Could not load the selected snapshot.", variant: "destructive" });
    }
    setIsLoadingAction(false);
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    setIsLoadingAction(true);
    deleteSavedSimulation(snapshotId);
    toast({ title: "Snapshot Deleted", description: "The simulation snapshot has been removed." });
    setIsLoadingAction(false);
  };


  if (!isAuthenticated) {
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
              Inceptico Preferences
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
              Review and load past simulation snapshots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {savedSimulations.length === 0 ? (
               <div className="text-center text-muted-foreground py-10">
                <p>No snapshots saved yet.</p>
                <p className="text-xs">Save snapshots from the Innovation Lab to revisit them here.</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[300px] pr-2">
                <ul className="space-y-3">
                  {savedSimulations.map((snapshot) => (
                    <li key={snapshot.id} className="p-3 border rounded-md bg-card/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{snapshot.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Saved: {new Date(snapshot.createdAt).toLocaleDateString()} | Sim Month: {snapshot.simulationState.simulationMonth}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-2 sm:mt-0 shrink-0">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isLoadingAction} className="border-green-500 text-green-600 hover:bg-green-500/10 hover:text-green-700">
                              <ListRestart className="mr-2 h-4 w-4"/> Load
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Load Simulation Snapshot?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will replace your current simulation state with "{snapshot.name}". Are you sure?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isLoadingAction}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleLoadSnapshot(snapshot.id, snapshot.name)} disabled={isLoadingAction} className="bg-green-600 hover:bg-green-700">
                                {isLoadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Load"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="sm" disabled={isLoadingAction} className="bg-red-600/10 border-red-600 text-red-700 hover:bg-red-600/20 hover:text-red-800">
                                <Trash2 className="mr-2 h-4 w-4"/> Delete
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Snapshot?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Permanently delete snapshot "{snapshot.name}"? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isLoadingAction}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSnapshot(snapshot.id)} disabled={isLoadingAction} className="bg-destructive hover:bg-destructive/90">
                                 {isLoadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

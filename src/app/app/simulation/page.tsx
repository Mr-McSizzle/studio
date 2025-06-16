
"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSimulationStore } from "@/store/simulationStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, Info, Zap, PackageOpen, Users, DollarSign, Brain, MinusCircle, PlusCircle, AlertTriangle, Activity, Tag, Briefcase, Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


const DEFAULT_SALARY_FALLBACK = 4000; 

const jobRoles = [
  { value: "Founder", label: "Founder" },
  { value: "Software Engineer - Senior", label: "Software Engineer - Senior" },
  { value: "Software Engineer - Junior", label: "Software Engineer - Junior" },
  { value: "Marketing Specialist", label: "Marketing Specialist" },
  { value: "Sales Representative", label: "Sales Representative" },
  { value: "UX Designer", label: "UX Designer" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "Operations Manager", label: "Operations Manager" },
  { value: "Customer Support Agent", label: "Customer Support Agent" },
  { value: "Data Analyst", label: "Data Analyst" },
  { value: "HR Manager", label: "HR Manager" },
  { value: "Financial Analyst", label: "Financial Analyst" },
  { value: "Business Development Manager", label: "Business Development Mgr." },
];


const ConceptualDigitalTwinVisual = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-muted/30 rounded-md p-4 aspect-video">
      {/* Background Grid/Pattern */}
      <svg width="100%" height="100%" className="absolute inset-0 z-0 opacity-20">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Central Core - representing the business */}
      <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 bg-primary/20 rounded-full flex items-center justify-center animate-subtle-pulse shadow-primary-glow-sm">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/40 rounded-full flex items-center justify-center ">
          <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground opacity-75" />
        </div>
      </div>

      {/* Orbiting Elements - representing data, market forces, etc. */}
      {[
        { size: 'w-8 h-8 sm:w-10 sm:h-10', orbitClass: 'animate-orbit-1', color: 'bg-accent/70', delay: '0s' },
        { size: 'w-6 h-6 sm:w-8 sm:h-8', orbitClass: 'animate-orbit-2', color: 'bg-secondary/70', delay: '0.5s' },
        { size: 'w-4 h-4 sm:w-6 sm:h-6', orbitClass: 'animate-orbit-3', color: 'bg-primary/60', delay: '1s' },
      ].map((orbit, index) => (
        <div
          key={index}
          className={`absolute z-0 ${orbit.size} ${orbit.color} rounded-full opacity-70 shadow-md ${orbit.orbitClass}`}
          style={{ animationDelay: orbit.delay }}
        />
      ))}

      {/* Connecting Lines (Conceptual) - could be more complex with SVG */}
      <div className="absolute z-0 w-px h-1/3 bg-gradient-to-b from-transparent via-accent/50 to-primary/50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] rotate-45 opacity-50" />
      <div className="absolute z-0 w-px h-1/3 bg-gradient-to-b from-transparent via-accent/50 to-primary/50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-20%] rotate-[-45deg] opacity-50" />
      <div className="absolute z-0 h-px w-1/3 bg-gradient-to-r from-transparent via-accent/50 to-primary/50 top-1/2 left-1/2 -translate-y-1/2 -translate-x-[120%] rotate-[25deg] opacity-50" />
       <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground z-20 bg-background/50 px-2 py-1 rounded">
        Conceptual Digital Twin Visualization
      </p>
    </div>
  );
};


export default function SimulationPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Selectors for specific state pieces and actions
  const isInitialized = useSimulationStore(state => state.isInitialized);
  const simulationMonth = useSimulationStore(state => state.simulationMonth);
  const financials = useSimulationStore(state => state.financials);
  const product = useSimulationStore(state => state.product);
  const resources = useSimulationStore(state => state.resources); // For initial local state sync
  const teamToDisplay = useSimulationStore(state => state.isInitialized ? state.resources.team : []);

  const setMarketingSpend = useSimulationStore(state => state.setMarketingSpend);
  const setRndSpend = useSimulationStore(state => state.setRndSpend);
  const setPricePerUser = useSimulationStore(state => state.setPricePerUser);
  const adjustTeamMemberCount = useSimulationStore(state => state.adjustTeamMemberCount);

  const currencySymbol = financials.currencySymbol || "$";

  const [localMarketingSpend, setLocalMarketingSpend] = useState(resources.marketingSpend);
  const [localRndSpend, setLocalRndSpend] = useState(resources.rndSpend);
  const [localPricePerUser, setLocalPricePerUser] = useState(product.pricePerUser);

  const [newMemberName, setNewMemberName] = useState(""); 
  const [roleInputValue, setRoleInputValue] = useState(""); 
  const [finalRoleValue, setFinalRoleValue] = useState<string>(""); 
  const [newMemberSalary, setNewMemberSalary] = useState("");
  const [roleComboboxOpen, setRoleComboboxOpen] = useState(false);


  useEffect(() => {
     if (!isInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
        router.replace('/app/setup');
    }
  }, [isInitialized, simulationMonth, router]);

  useEffect(() => {
    if (isInitialized) {
      // Sync local state with store state if needed, e.g., when component mounts or isInitialized changes
      setLocalMarketingSpend(useSimulationStore.getState().resources.marketingSpend);
      setLocalRndSpend(useSimulationStore.getState().resources.rndSpend);
      setLocalPricePerUser(useSimulationStore.getState().product.pricePerUser);
    } else {
      setLocalMarketingSpend(0);
      setLocalRndSpend(0);
      setLocalPricePerUser(0);
    }
  }, [isInitialized]); // Removed direct resource dependencies to avoid loop with local state updates

  const handleMarketingSpendChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setLocalMarketingSpend(isNaN(value) ? 0 : value);
  };
   const applyMarketingSpend = () => {
    if(isInitialized) setMarketingSpend(localMarketingSpend);
  };


  const handleRndSpendChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setLocalRndSpend(isNaN(value) ? 0 : value);
  };
  const applyRndSpend = () => {
    if(isInitialized) setRndSpend(localRndSpend);
  };

  const handlePricePerUserChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLocalPricePerUser(isNaN(value) ? 0 : value);
  };
  const applyPricePerUser = () => {
    if(isInitialized) setPricePerUser(localPricePerUser);
  };

  const handleAddTeamMember = (e: FormEvent) => {
    e.preventDefault();
    if (!isInitialized) {
      toast({ title: "Error", description: "Simulation not initialized.", variant: "destructive" });
      return;
    }
    if (!finalRoleValue.trim()) {
      toast({ title: "Role Required", description: "Please select or add a role for the new team member.", variant: "destructive" });
      return;
    }
    const salaryNum = parseFloat(newMemberSalary);
    if (isNaN(salaryNum) || salaryNum < 0) {
      toast({ title: "Invalid Salary", description: "Please enter a valid, non-negative salary.", variant: "destructive" });
      return;
    }

    adjustTeamMemberCount(finalRoleValue.trim(), 1, salaryNum);
    toast({
      title: "Team Member Added",
      description: `${newMemberName || 'A new ' + finalRoleValue.trim()} (Role: ${finalRoleValue.trim()}) added with a salary of ${currencySymbol}${salaryNum.toLocaleString()}.`,
    });
    setNewMemberName("");
    setFinalRoleValue("");
    setRoleInputValue("");
    setNewMemberSalary("");
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
          <Zap className="h-8 w-8 text-accent" />
          Decision Controls ({currencySymbol} {financials.currencyCode})
        </h1>
        <p className="text-muted-foreground">
          Manage your startup's resources and make strategic decisions for your digital twin. Advance months on the Dashboard to see their impact.
        </p>
      </header>

      {!isInitialized && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Please go to the "Setup Simulation" page to initialize your digital twin before interacting with decision controls.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button>
          </AlertDescription>
        </Alert>
      )}

       {financials.cashOnHand <= 0 && isInitialized && (
         <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Game Over - Out of Cash!</AlertTitle>
          <AlertDescription>
            Your startup has run out of cash. Decision controls are disabled. Reset the simulation from the dashboard to try again.
          </AlertDescription>
        </Alert>
      )}


      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <PackageOpen className="h-6 w-6 text-primary" /> Your Business Digital Twin
              </CardTitle>
              <CardDescription>
                A conceptual visualization of your startup's simulated environment. True interactive 3D is a future goal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConceptualDigitalTwinVisual />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <SlidersHorizontal className="h-6 w-6 text-accent" />
              <CardTitle className="font-headline">Monthly Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="price-per-user" className="flex items-center gap-2"><Tag className="h-4 w-4"/>Monthly Price Per User ({currencySymbol})</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="price-per-user"
                    type="number"
                    value={localPricePerUser}
                    onChange={handlePricePerUserChange}
                    onBlur={applyPricePerUser}
                    min="0"
                    step="0.01" 
                    disabled={!isInitialized || financials.cashOnHand <= 0}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Current: {currencySymbol}{isInitialized ? product.pricePerUser.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "N/A"}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="marketing-spend" className="flex items-center gap-2"><DollarSign className="h-4 w-4"/>Monthly Marketing Spend ({currencySymbol})</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="marketing-spend"
                    type="number"
                    value={localMarketingSpend}
                    onChange={handleMarketingSpendChange}
                    onBlur={applyMarketingSpend}
                    min="0"
                    disabled={!isInitialized || financials.cashOnHand <= 0}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Current: {currencySymbol}{isInitialized ? useSimulationStore.getState().resources.marketingSpend.toLocaleString() : "N/A"}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="rnd-spend" className="flex items-center gap-2"><Brain className="h-4 w-4"/>Monthly R&amp;D Spend ({currencySymbol})</Label>
                 <div className="flex items-center gap-2">
                  <Input
                    id="rnd-spend"
                    type="number"
                    value={localRndSpend}
                    onChange={handleRndSpendChange}
                    onBlur={applyRndSpend}
                    min="0"
                    disabled={!isInitialized || financials.cashOnHand <= 0}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Current: {currencySymbol}{isInitialized ? useSimulationStore.getState().resources.rndSpend.toLocaleString() : "N/A"}</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="flex items-center gap-2 font-semibold text-base"><Users className="h-5 w-5"/>Team Management</Label>
                
                <ScrollArea className="max-h-48 pr-2">
                <div className="space-y-3">
                  {teamToDisplay.length > 0 ? teamToDisplay.map(member => (
                    <div key={member.role} className="flex items-center justify-between p-2 border border-border/70 rounded-md bg-card/50">
                      <div>
                        <p className="font-medium text-sm">{member.role}: {member.count}</p>
                        <p className="text-xs text-muted-foreground">Salary: {currencySymbol}{member.salary.toLocaleString()}/mo each</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => adjustTeamMemberCount(member.role, -1)}
                          disabled={!isInitialized || member.count === 0 || (member.role.toLowerCase() === 'founder' && member.count <=1) || financials.cashOnHand <= 0}
                          aria-label={`Reduce ${member.role}`}
                          className="h-7 w-7"
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => adjustTeamMemberCount(member.role, 1, member.salary || DEFAULT_SALARY_FALLBACK)}
                          disabled={!isInitialized || financials.cashOnHand <= 0}
                          aria-label={`Hire ${member.role}`}
                          className="h-7 w-7"
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) : (
                     <p className="text-xs text-muted-foreground text-center py-2">
                       {isInitialized ? "No team members defined yet. Add some below." : "Initialize simulation to manage team."}
                     </p>
                  )}
                </div>
                </ScrollArea>

                <Separator className="my-4"/>

                <form onSubmit={handleAddTeamMember} className="space-y-3 p-3 border border-dashed rounded-md bg-muted/30">
                  <h4 className="text-sm font-medium flex items-center gap-2"><UserPlus className="h-4 w-4"/>Add New Team Member</h4>
                  <div className="space-y-1">
                    <Label htmlFor="new-member-name" className="text-xs">Name (Optional)</Label>
                    <Input
                      id="new-member-name"
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="e.g., Jane Doe"
                      disabled={!isInitialized || financials.cashOnHand <= 0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-member-role-trigger" className="text-xs">Role</Label>
                    <Popover open={roleComboboxOpen} onOpenChange={setRoleComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="new-member-role-trigger"
                          variant="outline"
                          role="combobox"
                          aria-expanded={roleComboboxOpen}
                          className="w-full justify-between font-normal text-sm"
                          disabled={!isInitialized || financials.cashOnHand <= 0}
                        >
                          {finalRoleValue
                            ? (jobRoles.find((role) => role.value.toLowerCase() === finalRoleValue.toLowerCase())?.label || finalRoleValue)
                            : "Select or type role..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search or type new role..."
                            value={roleInputValue}
                            onValueChange={(search) => {
                                setRoleInputValue(search);
                                if (!search.trim()) { 
                                    setFinalRoleValue(""); 
                                } else if (!jobRoles.some(jr => jr.label.toLowerCase() === search.trim().toLowerCase() || jr.value.toLowerCase() === search.trim().toLowerCase())) {
                                    // If typed text doesn't match predefined, keep finalRoleValue potentially as the typed custom role
                                    // The selection of the "Add new role" CommandItem will explicitly set finalRoleValue
                                }
                            }}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {roleInputValue.trim() ? `Press Enter or click to add "${roleInputValue.trim()}"` : "No role found."}
                            </CommandEmpty>
                            <CommandGroup>
                              {jobRoles.map((role) => (
                                <CommandItem
                                  key={role.value}
                                  value={role.value}
                                  onSelect={(currentValue) => {
                                    setFinalRoleValue(jobRoles.find(r => r.value.toLowerCase() === currentValue.toLowerCase())?.value || currentValue);
                                    setRoleInputValue(jobRoles.find(r => r.value.toLowerCase() === currentValue.toLowerCase())?.label || currentValue);
                                    setRoleComboboxOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      finalRoleValue.toLowerCase() === role.value.toLowerCase() ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {role.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                             {roleInputValue.trim() && !jobRoles.some(jr => jr.label.toLowerCase() === roleInputValue.trim().toLowerCase() || jr.value.toLowerCase() === roleInputValue.trim().toLowerCase()) && (
                              <CommandItem
                                key={roleInputValue.trim()}
                                value={roleInputValue.trim()}
                                onSelect={(currentValue) => {
                                  setFinalRoleValue(currentValue); // Set the custom typed value
                                  setRoleInputValue(currentValue); 
                                  setRoleComboboxOpen(false);
                                }}
                                className="text-accent font-medium"
                              >
                                <PlusCircle className="mr-2 h-4 w-4" /> Add new role: "{roleInputValue.trim()}"
                              </CommandItem>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-member-salary" className="text-xs">Monthly Salary ({currencySymbol})</Label>
                    <Input
                      id="new-member-salary"
                      type="number"
                      value={newMemberSalary}
                      onChange={(e) => setNewMemberSalary(e.target.value)}
                      placeholder={`e.g., ${DEFAULT_SALARY_FALLBACK}`}
                      min="0"
                      disabled={!isInitialized || financials.cashOnHand <= 0}
                    />
                  </div>
                  <Button 
                    type="submit"
                    disabled={!isInitialized || financials.cashOnHand <= 0 || !finalRoleValue.trim() || !newMemberSalary.trim()}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="sm"
                  >
                    <UserPlus className="mr-2 h-4 w-4"/> Add to Team
                  </Button>
                </form>
              </div>

              <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-md border border-secondary mt-4">
                <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-secondary-foreground">
                  Make your monthly strategic adjustments here. Then, go to the <strong>Dashboard</strong> and click "Simulate Next Month" to see their impact.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
    

    

    
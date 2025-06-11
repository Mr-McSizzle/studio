
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SlidersHorizontal, Info, Construction } from "lucide-react";

export default function SimulationPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground">Interactive Simulation</h1>
        <p className="text-muted-foreground">
          Visualize your startup's journey and test "what-if" scenarios.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="font-headline">3D Simulation Environment</CardTitle>
              <CardDescription>
                Watch your decisions unfold in a dynamic visual space.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex flex-col items-center justify-center text-muted-foreground p-8">
                <Construction className="h-16 w-16 mb-4 text-accent" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Under Development</h3>
                <p className="text-center">
                  The interactive 3D simulation environment is currently being built.
                </p>
                <p className="text-xs text-center mt-1">
                   Future updates will bring your startup's world to life here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
               <SlidersHorizontal className="h-6 w-6 text-accent" />
              <CardTitle className="font-headline">Scenario Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Adjust variables to see their real-time impact on your simulation. (Controls to be implemented)
              </p>
              <div className="p-4 border border-dashed border-border rounded-md text-center text-muted-foreground min-h-[100px] flex flex-col justify-center items-center">
                <Construction className="h-8 w-8 mb-2 text-accent" />
                <p className="font-medium text-foreground">Control Panel</p>
                <p className="text-xs">Interactive controls for the simulation will be available here.</p>
              </div>
               <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-md border border-secondary">
                <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-secondary-foreground">
                  <strong>Note:</strong> This section will house dynamic controls for funding, marketing, hiring, etc., once implemented.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

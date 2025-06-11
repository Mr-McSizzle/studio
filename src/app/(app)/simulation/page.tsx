import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SlidersHorizontal, Info } from "lucide-react";

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
                Watch your decisions unfold in a dynamic visual space. (Placeholder)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <Image
                  src="https://placehold.co/1200x675.png"
                  alt="3D Simulation Environment Placeholder"
                  width={1200}
                  height={675}
                  className="object-cover rounded-md"
                  data-ai-hint="abstract technology"
                />
              </div>
               <p className="text-sm text-muted-foreground mt-4 text-center">
                Interactive 3D environment rendering here.
              </p>
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
                Adjust variables like funding, marketing spend, hiring pace, and product features to see their real-time impact on your simulation.
              </p>
              <div className="p-4 border border-dashed border-border rounded-md text-center text-muted-foreground">
                <p>Control Panel UI (Placeholder)</p>
                <ul className="list-disc list-inside text-left mt-2 text-sm">
                    <li>Adjust Funding: $ <span className="text-foreground">100,000</span></li>
                    <li>Marketing Budget: $ <span className="text-foreground">5,000</span> / mo</li>
                    <li>Hiring Speed: <span className="text-foreground">2</span> eng/mo</li>
                </ul>
              </div>
               <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-md border border-secondary">
                <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-secondary-foreground">
                  <strong>Note:</strong> This section is a conceptual placeholder for interactive scenario controls.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

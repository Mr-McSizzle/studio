
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSimulationStore } from "@/store/simulationStore";
import { AgentCard } from "@/components/agents/agent-card";
import type { AIAgentProfile } from "@/types/simulation";
import {
  Brain,
  Calculator,
  Megaphone,
  MessageCircle,
  Users2,
  Globe2,
  Lightbulb,
  FlaskConical,
  Users,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const agentsList: AIAgentProfile[] = [
  {
    id: "eve-hive-mind",
    name: "EVE, the Hive Mind",
    shortName: "EVE",
    title: "AI Queen Hive Mind Assistant",
    icon: Brain,
    iconColorClass: "text-primary-foreground",
    gradientFromClass: "from-primary",
    gradientToClass: "to-red-400", // A slightly lighter red
    description: "Your central AI strategist. EVE coordinates the specialized AI agents, synthesizes insights, and provides personalized guidance throughout your ForgeSim journey.",
    specialties: ["Strategic Coordination", "Personalized Guidance", "Insight Synthesis", "Simulation Navigation"],
    actionText: "Consult EVE",
    actionLink: "/app/mentor",
  },
  {
    id: "alex-accountant",
    name: "Alex, the Accountant",
    shortName: "Alex",
    title: "AI Financial Strategist",
    icon: Calculator,
    iconColorClass: "text-accent-foreground",
    gradientFromClass: "from-accent",
    gradientToClass: "to-yellow-400",
    description: "Alex manages all things financial: budget allocation, cash flow analysis, financial planning, and profitability assessments.",
    specialties: ["Budgeting & Forecasting", "Cash Flow Management", "Runway Calculation", "Financial Planning"],
    actionText: "Ask Alex for Financials",
    actionLink: "/app/mentor?focus=alex",
  },
  {
    id: "maya-marketing-guru",
    name: "Maya, the Marketing Guru",
    shortName: "Maya",
    title: "AI Go-To-Market Expert",
    icon: Megaphone,
    iconColorClass: "text-primary-foreground",
    gradientFromClass: "from-pink-500",
    gradientToClass: "to-purple-500",
    description: "Maya crafts your go-to-market strategy, advises on brand building, and helps design effective marketing campaigns.",
    specialties: ["Go-To-Market Strategy", "Brand Building", "Campaign Design", "Market Positioning"],
    actionText: "Discuss Marketing with Maya",
    actionLink: "/app/mentor?focus=maya",
  },
  {
    id: "ty-social-media",
    name: "Ty, the Social Media Strategist",
    shortName: "Ty",
    title: "AI Digital Engagement Lead",
    icon: MessageCircle,
    iconColorClass: "text-primary-foreground",
    gradientFromClass: "from-blue-500",
    gradientToClass: "to-sky-400",
    description: "Ty specializes in organic and paid social media strategies, drafting mockup campaigns, and analyzing virality potential.",
    specialties: ["Social Media Strategy (Organic & Paid)", "Campaign Mockups", "Virality Prediction", "Community Engagement"],
    actionText: "Plan Social Strategy with Ty",
    actionLink: "/app/mentor?focus=ty",
  },
  {
    id: "zara-focus-group",
    name: "Zara, the Focus Group Leader",
    shortName: "Zara",
    title: "AI Customer Insights Specialist",
    icon: Users2,
    iconColorClass: "text-primary-foreground",
    gradientFromClass: "from-green-500",
    gradientToClass: "to-teal-400",
    description: "Zara simulates customer feedback on your products, features, branding, and marketing messages, providing valuable market validation.",
    specialties: ["Simulated Customer Feedback", "Product Validation", "Brand Perception Analysis", "Concept Testing"],
    actionText: "Get Feedback from Zara",
    actionLink: "/app/mentor?focus=zara",
  },
  {
    id: "leo-expansion-expert",
    name: "Leo, the Expansion Expert",
    shortName: "Leo",
    title: "AI Growth & Scaling Advisor",
    icon: Globe2,
    iconColorClass: "text-primary-foreground",
    gradientFromClass: "from-indigo-500",
    gradientToClass: "to-purple-600",
    description: "Leo provides advice on scaling operations, entering new markets (including international), forming partnerships, and managing associated risks.",
    specialties: ["Market Expansion Strategy", "Operational Scaling", "Internationalization", "Partnership Development", "Risk Assessment"],
    actionText: "Explore Expansion with Leo",
    actionLink: "/app/mentor?focus=leo",
  },
  {
    id: "the-advisor",
    name: "The Advisor",
    shortName: "Advisor",
    title: "AI Industry & Competitive Analyst",
    icon: Lightbulb,
    iconColorClass: "text-accent-foreground",
    gradientFromClass: "from-gray-600",
    gradientToClass: "to-gray-400",
    description: "The Advisor offers strategic insights on industry best practices, competitive analysis, and overall market positioning to keep you ahead.",
    specialties: ["Industry Best Practices", "Competitive Analysis", "Market Positioning", "Strategic Trend Spotting"],
    actionText: "Seek Industry Advice",
    actionLink: "/app/mentor?focus=advisor",
  },
  {
    id: "brand-lab",
    name: "Brand Lab",
    shortName: "BrandLab",
    title: "AI Branding & Concept Reviewer",
    icon: FlaskConical,
    iconColorClass: "text-primary-foreground",
    gradientFromClass: "from-orange-500",
    gradientToClass: "to-amber-400",
    description: "The Brand Lab analyzes your branding concepts, product descriptions, and visual identity elements against target audience and market trends.",
    specialties: ["Branding Concept Feedback", "Product Description Analysis", "Visual Identity Review", "Market Trend Alignment"],
    actionText: "Test Branding Concepts",
    actionLink: "/app/mentor?focus=brandlab",
  },
];


export default function AIAgentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { isInitialized, simulationMonth } = useSimulationStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-10">
        <div className="flex items-center gap-4">
            <Users className="h-10 w-10 text-accent"/>
            <div>
                <h1 className="text-3xl font-headline text-foreground">
                Meet Your AI Agent Team
                </h1>
                <p className="text-muted-foreground">
                Leverage specialized AI expertise to guide your startup's journey in ForgeSim.
                </p>
            </div>
        </div>
      </header>

      {!isInitialized && (
        <Alert variant="default" className="mb-8 bg-secondary/30 border-secondary">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Your AI Agent team is ready! Initialize your main simulation to start collaborating with them effectively.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm" variant="outline">Setup Simulation</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
        {agentsList.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

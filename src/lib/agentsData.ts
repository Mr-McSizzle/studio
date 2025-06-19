
import type { AIAgentProfile } from '@/types/simulation';
import {
  Brain,
  Calculator,
  Megaphone,
  MessageCircle,
  Users2,
  Globe2,
  Lightbulb,
  FlaskConical,
} from "lucide-react";

export const agentsList: AIAgentProfile[] = [
  {
    id: "eve-hive-mind",
    name: "EVE, the Hive Mind",
    shortName: "EVE",
    title: "AI Queen Hive Mind Assistant",
    icon: Brain,
    iconColorClass: "text-primary-foreground",
    avatarUrl: "/new-assets/agents/eve-hive-mind.png",
    gradientFromClass: "from-primary",
    gradientToClass: "to-blue-400", // Adjusted to a lighter blue for EVE
    description: "Your central AI strategist. EVE coordinates the specialized AI agents, synthesizes insights, and provides personalized guidance throughout your Inceptico journey.",
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
    iconColorClass: "text-accent-foreground", // Silver text for dark accents
    avatarUrl: "/new-assets/agents/alex-accountant.png",
    gradientFromClass: "from-slate-600", // Darker silver/gray
    gradientToClass: "to-slate-400",    // Lighter silver/gray
    description: "Alex manages all things financial: budget allocation, cash flow analysis, financial planning, and profitability assessments.",
    specialties: ["Budgeting & Forecasting", "Cash Flow Management", "Runway Calculation", "Financial Planning"],
    actionText: "Chat with Alex",
    actionLink: "/app/agents/alex-accountant",
  },
  {
    id: "maya-marketing-guru",
    name: "Maya, the Marketing Guru",
    shortName: "Maya",
    title: "AI Go-To-Market Expert",
    icon: Megaphone,
    iconColorClass: "text-primary-foreground",
    avatarUrl: "/new-assets/agents/maya-marketing-guru.png",
    gradientFromClass: "from-sky-500",     // Light blue
    gradientToClass: "to-blue-600",      // Primary deep blue
    description: "Maya crafts your go-to-market strategy, advises on brand building, and helps design effective marketing campaigns.",
    specialties: ["Go-To-Market Strategy", "Brand Building", "Campaign Design", "Market Positioning"],
    actionText: "Chat with Maya",
    actionLink: "/app/agents/maya-marketing-guru",
  },
  {
    id: "ty-social-media",
    name: "Ty, the Social Media Strategist",
    shortName: "Ty",
    title: "AI Digital Engagement Lead",
    icon: MessageCircle,
    iconColorClass: "text-primary-foreground",
    avatarUrl: "/new-assets/agents/ty-social-media.png",
    gradientFromClass: "from-blue-500",     // Primary deep blue
    gradientToClass: "to-sky-400",        // Lighter sky blue
    description: "Ty specializes in organic and paid social media strategies. She drafts mockup campaigns and analyzes virality potential, ensuring your message hits the mark.",
    specialties: ["Social Media Strategy (Organic & Paid)", "Campaign Mockups", "Virality Prediction", "Community Engagement"],
    actionText: "Chat with Ty",
    actionLink: "/app/agents/ty-social-media",
  },
  {
    id: "zara-focus-group",
    name: "Zara, the Focus Group Leader",
    shortName: "Zara",
    title: "AI Customer Insights Specialist",
    icon: Users2,
    iconColorClass: "text-primary-foreground",
    avatarUrl: "/new-assets/agents/zara-focus-group.png",
    gradientFromClass: "from-cyan-500",    // Cyan/Teal
    gradientToClass: "to-sky-500",       // Lighter sky blue
    description: "Zara simulates customer feedback on your products, features, branding, and marketing messages, providing valuable market validation.",
    specialties: ["Simulated Customer Feedback", "Product Validation", "Brand Perception Analysis", "Concept Testing"],
    actionText: "Chat with Zara",
    actionLink: "/app/agents/zara-focus-group",
  },
  {
    id: "leo-expansion-expert",
    name: "Leo, the Expansion Expert",
    shortName: "Leo",
    title: "AI Growth & Scaling Advisor",
    icon: Globe2,
    iconColorClass: "text-primary-foreground",
    avatarUrl: "/new-assets/agents/leo-expansion-expert.png",
    gradientFromClass: "from-indigo-500",   // Indigo
    gradientToClass: "to-blue-600",       // Primary deep blue
    description: "Leo provides advice on scaling operations, entering new markets (including international), forming partnerships, and managing associated risks.",
    specialties: ["Market Expansion Strategy", "Operational Scaling", "Internationalization", "Partnership Development", "Risk Assessment"],
    actionText: "Chat with Leo",
    actionLink: "/app/agents/leo-expansion-expert",
  },
  {
    id: "the-advisor",
    name: "The Advisor",
    shortName: "Advisor",
    title: "AI Industry & Competitive Analyst",
    icon: Lightbulb,
    iconColorClass: "text-accent-foreground", // Silver text
    avatarUrl: "/new-assets/agents/the-advisor.png",
    gradientFromClass: "from-gray-700", // Darker gray for a sophisticated silver feel
    gradientToClass: "to-gray-500",   // Lighter gray
    description: "The Advisor offers strategic insights on industry best practices, competitive analysis, and overall market positioning to keep you ahead.",
    specialties: ["Industry Best Practices", "Competitive Analysis", "Market Positioning", "Strategic Trend Spotting"],
    actionText: "Chat with Advisor",
    actionLink: "/app/agents/the-advisor",
  },
  {
    id: "brand-lab",
    name: "Brand Lab",
    shortName: "BrandLab",
    title: "AI Branding & Concept Reviewer",
    icon: FlaskConical,
    iconColorClass: "text-primary-foreground",
    avatarUrl: "/new-assets/agents/brand-lab.png",
    gradientFromClass: "from-blue-400",    // Lighter blue
    gradientToClass: "to-sky-500",      // Sky blue
    description: "The Brand Lab analyzes your branding concepts, product descriptions, and visual identity elements against target audience and market trends.",
    specialties: ["Branding Concept Feedback", "Product Description Analysis", "Visual Identity Review", "Market Trend Alignment"],
    actionText: "Chat with Brand Lab",
    actionLink: "/app/agents/brand-lab",
  },
];

export const getAgentProfileById = (id: string): AIAgentProfile | undefined => {
  return agentsList.find(agent => agent.id === id);
};


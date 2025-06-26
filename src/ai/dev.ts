
import { config } from 'dotenv';
config();

import '@/ai/flows/prompt-startup.ts';
import '@/ai/flows/mentor-conversation.ts';
import '@/ai/flows/strategy-recommendations.ts';
import '@/ai/flows/simulate-month-flow.ts'; 
import '@/ai/flows/analyze-custom-scenario-flow.ts';
import '@/ai/flows/suggest-scenarios-flow.ts';
import '@/ai/flows/suggest-names-flow.ts'; // New flow for suggesting names
import '@/ai/flows/generate-dynamic-missions-flow.ts'; // New flow for dynamic missions
import '@/ai/flows/detailed-financial-analysis-flow.ts'; // New flow for financial analysis
import '@/ai/flows/competitor-analysis-flow.ts'; // New flow for competitor analysis
import '@/ai/flows/simulate-feature-launch-flow.ts'; // New flow for feature launch simulation
import '@/ai/flows/text-to-speech-flow.ts'; // New flow for Text-to-Speech
import '@/ai/flows/analyze-silly-idea-flow.ts'; // New flow for Absurdity Arena
import '@/ai/flows/submit-to-reddit-flow.ts'; // New flow for Reddit submission

// Renamed and New AI Agent Tools
import '@/ai/tools/alex-the-accountant-tool.ts'; 
import '@/ai/tools/maya-the-marketing-guru-tool.ts';
import '@/ai/tools/leo-the-expansion-expert-tool.ts';
import '@/ai/tools/ty-the-social-media-strategist-tool.ts'; 
import '@/ai/tools/zara-the-focus-group-leader-tool.ts';   
import '@/ai/tools/the-advisor-tool.ts'; 
import '@/ai/tools/brand-lab-tool.ts'; 
import '@/ai/tools/reddit-tool.ts'; // New Reddit placeholder tool

// Decision Control Tools
import '@/ai/tools/set-marketing-budget-tool.ts';
import '@/ai/tools/set-rnd-budget-tool.ts';
import '@/ai/tools/set-product-price-tool.ts';


// aiOperationsManagerTool is removed to align with new PRD

    

    








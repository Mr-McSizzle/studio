
import { config } from 'dotenv';
config();

import '@/ai/flows/prompt-startup.ts';
import '@/ai/flows/mentor-conversation.ts';
import '@/ai/flows/strategy-recommendations.ts';
import '@/ai/flows/simulate-month-flow.ts'; 
import '@/ai/flows/analyze-custom-scenario-flow.ts';
import '@/ai/flows/suggest-scenarios-flow.ts'; // New flow for suggesting scenarios

// Renamed and New AI Agent Tools
import '@/ai/tools/alex-the-accountant-tool.ts'; 
import '@/ai/tools/maya-the-marketing-guru-tool.ts';
import '@/ai/tools/leo-the-expansion-expert-tool.ts';
import '@/ai/tools/ty-the-social-media-strategist-tool.ts'; 
import '@/ai/tools/zara-the-focus-group-leader-tool.ts';   
import '@/ai/tools/the-advisor-tool.ts'; 
import '@/ai/tools/brand-lab-tool.ts'; 

// aiOperationsManagerTool is removed to align with new PRD

    

    


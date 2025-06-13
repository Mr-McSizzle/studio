
import { config } from 'dotenv';
config();

import '@/ai/flows/prompt-startup.ts';
import '@/ai/flows/mentor-conversation.ts';
import '@/ai/flows/strategy-recommendations.ts';
import '@/ai/flows/simulate-month-flow.ts'; 

// Renamed and New AI Agent Tools
import '@/ai/tools/alex-the-accountant-tool.ts'; 
import '@/ai/tools/maya-the-marketing-guru-tool.ts';
import '@/ai/tools/leo-the-expansion-expert-tool.ts';
import '@/ai/tools/ty-the-social-media-strategist-tool.ts'; // New
import '@/ai/tools/zara-the-focus-group-leader-tool.ts';   // New
// aiOperationsManagerTool is removed to align with new PRD

    
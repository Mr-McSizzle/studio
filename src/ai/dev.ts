
import { config } from 'dotenv';
config();

import '@/ai/flows/prompt-startup.ts';
import '@/ai/flows/mentor-conversation.ts';
import '@/ai/flows/strategy-recommendations.ts';
import '@/ai/flows/simulate-month-flow.ts'; 
import '@/ai/tools/accountant-tool.ts'; 
import '@/ai/tools/marketing-guru-tool.ts'; // Added new tool
import '@/ai/tools/operations-manager-tool.ts'; // Added new tool
import '@/ai/tools/expansion-expert-tool.ts'; // Added new tool

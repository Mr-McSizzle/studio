
import { config } from 'dotenv';
config();

import '@/ai/flows/prompt-startup.ts';
import '@/ai/flows/mentor-conversation.ts';
import '@/ai/flows/strategy-recommendations.ts';
import '@/ai/flows/simulate-month-flow.ts'; // Added new flow
import '@/ai/tools/accountant-tool.ts'; // Ensure tool is imported for Genkit discovery

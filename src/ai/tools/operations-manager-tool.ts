
'use server';
/**
 * @fileOverview An AI tool providing advice on operations, scaling, and team structure.
 *
 * - aiOperationsManagerTool - The Genkit tool definition.
 */

import {ai} from '@/ai/genkit';
import { 
  OperationsManagerToolInputSchema, 
  type OperationsManagerToolInput, 
  OperationsManagerToolOutputSchema,
  type OperationsManagerToolOutput
} from '@/types/simulation';

export const aiOperationsManagerTool = ai.defineTool(
  {
    name: 'aiOperationsManagerTool',
    description: 'Provides specialized advice on business operations, team structure, scaling processes, and resource allocation efficiency. Use this when the user asks for the AI Operations Manager\'s opinion or guidance on operational topics.',
    inputSchema: OperationsManagerToolInputSchema,
    outputSchema: OperationsManagerToolOutputSchema,
  },
  async (input: OperationsManagerToolInput): Promise<OperationsManagerToolOutput> => {
    let advice = "The AI Operations Manager has analyzed your situation. ";
    if (input.query.toLowerCase().includes("scaling")) {
      advice += "When scaling, it's crucial to ensure your foundational processes can handle increased load. This includes customer support, infrastructure, and internal communication. Consider automating repetitive tasks and clearly defining roles and responsibilities within the team. Phased scaling with monitoring is often safer than rapid, uncontrolled growth.";
    } else if (input.query.toLowerCase().includes("team") || input.query.toLowerCase().includes("hiring")) {
      advice += "For team structure, ensure you have the right roles to support your current product stage and growth trajectory. Hiring should be strategic; consider the cost versus the expected value a new team member brings. For early-stage startups, versatile individuals are often more valuable than hyper-specialized ones, unless a critical skill gap exists.";
    } else if (input.query.toLowerCase().includes("efficiency") || input.query.toLowerCase().includes("optimize")) {
      advice += "To optimize operations, regularly review your workflows for bottlenecks. Implement feedback loops from both your team and customers. Technology can often automate or streamline processes, freeing up human resources for higher-value tasks. Key Performance Indicators (KPIs) for operational efficiency should be tracked.";
    } else {
      advice = "The AI Operations Manager advises: Focus on building scalable systems from the outset, even if they seem like overkill initially. Document key processes and clearly define team roles. As you grow, regularly reassess your operational capacity and make proactive adjustments rather than reactive ones.";
    }
    
    return { advice };
  }
);


'use server';

/**
 * @fileOverview An AI agent that serves as a mentor and engages in natural language conversations
 * to provide business advice and guidance within the simulation.
 *
 * - mentorConversation - A function that handles the conversation with the AI mentor.
 * - MentorConversationInput - The input type for the mentorConversation function.
 * - MentorConversationOutput - The return type for the mentorConversation function.
 */

import {ai} from '@/ai/genkit';
import {z, Handlebars} from 'genkit';

const MentorConversationInputSchema = z.object({
  userInput: z
    .string()
    .describe('The user input to the AI mentor.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The conversation history between the user and the AI mentor.'),
});

export type MentorConversationInput = z.infer<typeof MentorConversationInputSchema>;

const MentorConversationOutputSchema = z.object({
  response: z.string().describe('The AI mentor response to the user input.'),
});

export type MentorConversationOutput = z.infer<typeof MentorConversationOutputSchema>;

export async function mentorConversation(input: MentorConversationInput): Promise<MentorConversationOutput> {
  return mentorConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mentorConversationPrompt',
  input: {
    schema: MentorConversationInputSchema,
  },
  output: {
    schema: MentorConversationOutputSchema,
  },
  prompt: `You are an AI business mentor within a business simulation. Your goal is to provide advice and guidance to the user based on their input and the current state of the simulation.

  The user is seeking your advice. Use the conversation history to provide tailored and helpful responses.

  Current User Input: {{{userInput}}}

  {{#if conversationHistory}}
  Conversation History:
  {{#each conversationHistory}}
  {{#ifCond role '===' 'user'}}
  User: {{{content}}}
  {{else}}
  Mentor: {{{content}}}
  {{/ifCond}}
  {{/each}}
  {{/if}}

  Provide your response as the AI mentor:
  {{output}}
  `,
});

Handlebars.registerHelper('ifCond', function (v1: any, operator: string, v2: any, options: any) {
  switch (operator) {
  case '===':
  return (v1 === v2) ? options.fn(this) : options.inverse(this);
  default:
  return options.inverse(this);
  }
});

const mentorConversationFlow = ai.defineFlow(
  {
    name: 'mentorConversationFlow',
    inputSchema: MentorConversationInputSchema,
    outputSchema: MentorConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    return {
      response: output!.response,
    };
  }
);

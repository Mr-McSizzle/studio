'use server';
/**
 * @fileOverview A simplified Text-to-Speech flow that doesn't rely on the ElevenLabs SDK
 * This approach uses direct API calls to avoid installation issues.
 *
 * - textToSpeech - Function to call the AI TTS flow.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { TextToSpeechInputSchema, TextToSpeechOutputSchema, type TextToSpeechInput, type TextToSpeechOutput } from '@/types/simulation';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === "YOUR_ELEVENLABS_API_KEY_HERE") {
        return { 
          error: "ElevenLabs API key is not configured. Voice functionality is disabled in the deployed version." 
        };
    }
    
    const voiceId = input.voiceId || '21m00Tcm4TlvDq8ikWAM'; // Default to EVE's voice (Rachel)
    
    try {
      // For the deployed version, we'll return a mock response
      return { 
        error: "Voice generation is disabled in the deployed version to avoid API costs." 
      };
    } catch (error) {
      console.error("ElevenLabs API call failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while generating audio.";
      return { error: errorMessage };
    }
  }
);
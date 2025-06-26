
'use server';
/**
 * @fileOverview A Genkit flow to handle Text-to-Speech (TTS) conversion using the ElevenLabs API.
 * This flow now uses the official elevenlabs Node.js package.
 *
 * - textToSpeech - Function to call the AI TTS flow.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { TextToSpeechInputSchema, TextToSpeechOutputSchema, type TextToSpeechInput, type TextToSpeechOutput } from '@/types/simulation';
import { ElevenLabsClient } from 'elevenlabs';

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
        const errorMsg = "ElevenLabs API key is not configured. Please set ELEVENLABS_API_KEY in your .env file.";
        console.error(errorMsg);
        return { error: errorMsg };
    }
    
    const elevenlabs = new ElevenLabsClient({
        apiKey: ELEVENLABS_API_KEY,
    });
    
    const voiceId = input.voiceId || '21m00Tcm4TlvDq8ikWAM'; // Default to EVE's voice (Rachel)
    
    try {
        const audio = await elevenlabs.generate({
            voice: voiceId,
            text: input.text,
            model_id: 'eleven_multilingual_v2',
        });

        // The SDK returns a ReadableStream. We need to collect it into a Buffer.
        const chunks: Buffer[] = [];
        for await (const chunk of audio) {
            chunks.push(chunk);
        }
        const content = Buffer.concat(chunks);
        const audioDataUri = `data:audio/mpeg;base64,${content.toString('base64')}`;
      
        return { audioDataUri };

    } catch (error) {
        console.error("ElevenLabs SDK call failed:", error);
        const errorMessage = error instanceof Error ? `ElevenLabs API error: ${error.message}` : "An unknown error occurred while generating audio from ElevenLabs.";
        return { error: errorMessage };
    }
  }
);

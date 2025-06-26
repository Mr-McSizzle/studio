
'use server';
/**
 * @fileOverview A Genkit flow to handle Text-to-Speech (TTS) conversion using the ElevenLabs API directly.
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
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key is not configured. Please set ELEVENLABS_API_KEY in your .env file.");
    }
    
    const voiceId = input.voiceId || '21m00Tcm4TlvDq8ikWAM'; // Default to EVE's voice (Rachel)
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: input.text,
          model_id: 'eleven_multilingual_v2',
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`ElevenLabs API Error (${response.status}): ${errorBody}`);
        throw new Error(`ElevenLabs API responded with status ${response.status}`);
      }

      const audioArrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(audioArrayBuffer);
      const audioDataUri = `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;
      
      return { audioDataUri };

    } catch (error) {
      console.error("ElevenLabs API call failed:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate audio from ElevenLabs: ${error.message}`);
      }
      throw new Error("An unknown error occurred while generating audio from ElevenLabs.");
    }
  }
);

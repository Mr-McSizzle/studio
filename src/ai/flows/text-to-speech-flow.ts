
'use server';
/**
 * @fileOverview A Genkit flow to handle Text-to-Speech (TTS) conversion by directly calling the ElevenLabs API.
 * This approach avoids using the SDK to bypass installation issues.
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
        const errorMsg = "ElevenLabs API key is not configured. Please set ELEVENLABS_API_KEY in your .env file.";
        console.error(errorMsg);
        return { error: errorMsg };
    }
    
    const voiceId = input.voiceId || '21m00Tcm4TlvDq8ikWAM'; // Default to EVE's voice (Rachel)
    const modelId = 'eleven_multilingual_v2';
    const voiceUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    const headers = {
      "Accept": "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
    };

    const body = JSON.stringify({
      text: input.text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    });

    try {
      const response = await fetch(voiceUrl, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioDataUri = `data:audio/mpeg;base64,${Buffer.from(audioBuffer).toString('base64')}`;
      
      return { audioDataUri };

    } catch (error) {
      console.error("ElevenLabs API call failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while generating audio.";
      return { error: errorMessage };
    }
  }
);

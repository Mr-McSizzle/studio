
'use server';
/**
 * @fileOverview A Genkit flow to handle Text-to-Speech (TTS) conversion using Google AI.
 *
 * - textToSpeech - Function to call the AI TTS flow.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';
import { TextToSpeechInputSchema, TextToSpeechOutputSchema, type TextToSpeechInput, type TextToSpeechOutput } from '@/types/simulation';

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

// Helper to convert PCM buffer to WAV base64 string
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}


const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    // Map ElevenLabs voice ID to Gemini voice name
    const elevenLabsVoiceMap: Record<string, string> = {
        '21m00Tcm4TlvDq8ikWAM': 'Algenib', // Rachel -> Algenib (Female)
        'pNInz6obpgDQGcFmaJgB': 'Antares', // Adam -> Antares (Male)
        'jBpfuIE2acCO8z3wKNLl': 'Caph', // Gigi -> Caph (Female)
        'MF3mGyEYCl7XYWbV9V6O': 'Deneb', // Elli -> Deneb (Female)
        'piTKgcLEGmPE4e6mEKli': 'Hadar',  // Nicole -> Hadar (Female)
        'ErXwobaYiN019PkySvjV': 'Bellatrix', // Antoni -> Bellatrix (Male)
        'JBFqnCBsd6RMkjVDRZzb': 'Enif', // George -> Enif (Male)
        'jsCqWAovK2LkecY7zXl4': 'Fomalhaut', // Freya -> Fomalhaut (Female)
    };

    const selectedVoiceName = input.voiceId ? (elevenLabsVoiceMap[input.voiceId] || 'Algenib') : 'Algenib';
    
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoiceName },
          },
        },
      },
      prompt: input.text,
    });
    
    if (!media || !media.url) {
      throw new Error('No media returned from TTS model');
    }
    
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const base64Wav = await toWav(audioBuffer);
    
    return { audioDataUri: `data:audio/wav;base64,${base64Wav}` };
  }
);

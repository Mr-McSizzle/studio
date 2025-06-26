
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


// Full list of available Google TTS prebuilt voices for mapping.
// We use the ElevenLabs Voice IDs from agentsData.ts as keys to map to these Google voices.
const GOOGLE_VOICE_MAP: Record<string, string> = {
    // Original Mappings (for consistency with previous setup)
    '21m00Tcm4TlvDq8ikWAM': 'Algenib',    // Rachel (F) -> EVE -> Algenib (F)
    'pNInz6obpgDQGcFmaJgB': 'Antares',    // Adam (M) -> Alex -> Antares (M)
    'jBpfuIE2acCO8z3wKNLl': 'Caph',       // Gigi (F) -> Maya -> Caph (F)
    'piTKgcLEGmPE4e6mEKli': 'Hadar',      // Nicole (F) -> Zara -> Hadar (F)
    'JBFqnCBsd6RMkjVDRZzb': 'Enif',       // George (M) -> The Advisor -> Enif (M)
    
    // Re-mapped voices for more variety
    'MF3mGyEYCl7XYWbV9V6O': 'Spica',      // Elli (F) -> Ty -> Spica (F)
    'ErXwobaYiN019PkySvjV': 'Rigel',      // Antoni (M) -> Leo -> Rigel (M)
    'jsCqWAovK2LkecY7zXl4': 'Vega',       // Freya (F) -> Brand Lab -> Vega (F)
    
    // You can assign any of the remaining ElevenLabs IDs to these other available Google voices:
    // --- Other Available Male Voices ---
    // 'some_other_elevenlabs_id': 'Achernar',
    // 'some_other_elevenlabs_id': 'Aldebaran',
    // 'some_other_elevenlabs_id': 'Pollux',
    // 'some_other_elevenlabs_id': 'Procyon',
    // 'some_other_elevenlabs_id': 'Bellatrix',
    
    // --- Other Available Female Voices ---
    // 'some_other_elevenlabs_id': 'Canopus',
    // 'some_other_elevenlabs_id': 'Mira',
    // 'some_other_elevenlabs_id': 'Sirius',
    // 'some_other_elevenlabs_id': 'Deneb',
};


const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    // Select the voice from the map, or fall back to Algenib (EVE's voice) if not found.
    const selectedVoiceName = input.voiceId ? (GOOGLE_VOICE_MAP[input.voiceId] || 'Algenib') : 'Algenib';
    
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

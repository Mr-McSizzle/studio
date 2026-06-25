import {genkit} from 'genkit';
import {groq, llama33x70bVersatile} from 'genkitx-groq';
import {env} from '@/env';

// Patch tool support for Llama 3.3 since the plugin has it disabled by default
if (llama33x70bVersatile.info && llama33x70bVersatile.info.supports) {
  llama33x70bVersatile.info.supports.tools = true;
}

export const ai = genkit({
  plugins: [groq({ apiKey: env.GROQ_API_KEY })],
  model: llama33x70bVersatile,
});

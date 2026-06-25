import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  GROQ_API_KEY: z.string().min(1, "Groq API key is required"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
});

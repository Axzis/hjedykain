
'use server';
import 'dotenv/config';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  // logLevel: 'debug', // logLevel is not a valid option in Genkit v1.x
  enableTracing: true,
});

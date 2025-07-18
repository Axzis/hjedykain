
'use server';
import 'dotenv/config';
import { genkit, configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

configureGenkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracing: true,
});

export const ai = genkit;

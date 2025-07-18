// This file is intentionally left blank. 
// The AI logic has been consolidated into the flow file to resolve build issues.
// We will restore it in a more robust way.
'use server';
/**
 * @fileOverview Centralized Genkit AI configuration.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize and export the AI instance.
// This instance will be imported by all flows.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracing: true,
});

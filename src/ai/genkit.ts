
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { Plugin } from 'genkit';

const plugins: Plugin<any>[] = [];

if (process.env.GEMINI_API_KEY) {
    plugins.push(googleAI());
} else {
    console.warn(`
#####################################################################
# WARNING: GEMINI_API_KEY is not set.                               #
# The AI features of this application will be disabled.             #
# To enable them, add your GEMINI_API_KEY as a secret in your       #
# Firebase App Hosting backend configuration.                       #
#####################################################################
    `);
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.0-flash',
});

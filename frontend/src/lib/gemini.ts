import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// List of candidate models to try in order of preference.
// This resolves quota/limit issues with gemini-2.0-flash and 404 errors with gemini-1.5-flash.
const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

function createModelWrapper(generationConfig?: any) {
  return {
    generateContent: async function (prompt: any) {
      let lastError: any = null;
      
      for (const modelName of MODELS_TO_TRY) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig,
          });
          return await model.generateContent(prompt);
        } catch (error: any) {
          lastError = error;
          const errorMessage = error?.message || '';
          
          const isRetryableError = 
            errorMessage.includes('429') || 
            errorMessage.includes('quota') || 
            errorMessage.includes('Quota') ||
            errorMessage.includes('limit') ||
            errorMessage.includes('404') ||
            errorMessage.includes('not found') ||
            errorMessage.includes('NotFound') ||
            errorMessage.includes('503') ||
            errorMessage.includes('500') ||
            errorMessage.includes('504') ||
            errorMessage.includes('unavailable') ||
            errorMessage.includes('Unavailable') ||
            errorMessage.includes('temporary') ||
            errorMessage.includes('demand') ||
            errorMessage.includes('service');

          if (isRetryableError) {
            console.warn(
              `[Gemini API] Model ${modelName} failed (temporary error: "${errorMessage}"). Trying next model in loop...`
            );
            continue;
          }
          // If it's a fatal configuration error (e.g. invalid API key), throw immediately
          throw error;
        }
      }
      throw lastError || new Error("All configured Gemini models failed to generate content.");
    }
  } as any;
}

export function getJsonModel() {
  return createModelWrapper({ responseMimeType: 'application/json' });
}

export function getTextModel() {
  return createModelWrapper();
}

export function cleanJsonResponse(text: string): string {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

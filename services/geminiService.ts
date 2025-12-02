/**
 * GEMINI SERVICE - AI Integration Layer
 * 
 * This service is the bridge between our UI and Google's Gemini API.
 * It implements a MODULAR PROMPT SYSTEM, meaning each "style" has its own prompt template.
 * 
 * KEY ARCHITECTURAL DECISION:
 * We separated prompts into individual files (services/prompts/) to make it easy
 * to add new styles WITHOUT touching this file. This follows the Open/Closed Principle.
 */

import { GoogleGenAI } from "@google/genai";
import { StyleId, getStyleById, legacyModeToStyleId } from "./prompts";

/**
 * CLIENT INITIALIZATION
 * We use a function instead of a top-level const to defer API key reading.
 * This ensures errors are thrown at runtime (when formatted), not import time.
 */
const getClient = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please add VITE_API_KEY to your .env.local file.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * MAIN FORMATTING FUNCTION
 * 
 * @param rawTextOrHtml - Can be plain text OR HTML (with <b>, <i>, etc.). The AI respects this.
 * @param mode - Either a legacy mode ('standard', 'juridical') OR a new StyleId ('magazine-modern').
 * @param language - Controls UI labels AND the target language for output.
 * @param preserveContent - CRITICAL FLAG. true = strict formatting only; false = AI can edit text.
 * 
 * FLOW:
 * 1. Resolve the Style ID (legacy modes are mapped to new IDs).
 * 2. Load the prompt template from the modular system.
 * 3. Call Gemini API.
 * 4. Return formatted HTML (ONLY the body content, no <html> or <head>).
 */
export const formatTextToLuxuryHtml = async (
  rawTextOrHtml: string,
  mode: StyleId | 'standard' | 'juridical' = 'standard',
  language: 'pt' | 'en' = 'pt',
  preserveContent: boolean = true
): Promise<string> => {
  const ai = getClient();

  // MODEL SELECTION
  // We use the "flash-preview" model for speed/cost balance.
  // For higher quality (but slower), switch to "gemini-2.0-pro".
  const model = "gemini-2.5-flash-preview-09-2025";

  // LEGACY MODE MAPPING
  // Older code might still call with 'standard' or 'juridical' strings.
  // We map these to the new StyleId system for consistency.
  const styleId = (mode === 'standard' || mode === 'juridical')
    ? legacyModeToStyleId(mode)
    : mode as StyleId;

  const styleDef = getStyleById(styleId);

  if (!styleDef) {
    throw new Error(`Style definition not found for id: ${styleId}`);
  }

  // PROMPT GENERATION
  // Each style module exports a getPrompt(language, preserveContent) function.
  // This keeps the AI instructions isolated and testable.
  const systemPrompt = styleDef.getPrompt(language, preserveContent);

  // TEMPERATURE = 0.3
  // Low temperature for consistency. We want the same input to produce similar output.
  // Higher temperature (0.7-1.0) would make the AI more "creative" but less predictable.
  const config = {
    temperature: 0.3,
  };

  try {
    // API CALL
    // We send the prompt + user content in a single message.
    // Future improvement: Implement streaming for real-time previews.
    const response = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n---\nINPUT CONTENT:\n${rawTextOrHtml}` }] }
      ],
      config: config
    });

    return response.text || "<p>Error: No content generated.</p>";
  } catch (error: any) {
    console.error("Formatting error:", error);

    // ERROR HANDLING STRATEGY
    // We alert the user immediately because formatting is the core feature.
    // Future improvement: Replace alert() with a toast notification system.
    alert(`Erro na IA: ${error.message || error}`);
    throw error;
  }
};
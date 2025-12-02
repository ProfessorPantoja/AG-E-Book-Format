import { GoogleGenAI } from "@google/genai";
import { StyleId, getStyleById, legacyModeToStyleId } from "./prompts";

const getClient = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please add VITE_API_KEY to your .env.local file.");
  }
  return new GoogleGenAI({ apiKey });
};

export const formatTextToLuxuryHtml = async (
  rawTextOrHtml: string,
  mode: StyleId | 'standard' | 'juridical' = 'standard',
  language: 'pt' | 'en' = 'pt',
  preserveContent: boolean = true
): Promise<string> => {
  const ai = getClient();

  // Use gemini-2.5-flash-preview-09-2025 as requested by user
  const model = "gemini-2.5-flash-preview-09-2025";

  // Resolve style ID (handle legacy modes)
  const styleId = (mode === 'standard' || mode === 'juridical')
    ? legacyModeToStyleId(mode)
    : mode as StyleId;

  const styleDef = getStyleById(styleId);

  if (!styleDef) {
    throw new Error(`Style definition not found for id: ${styleId}`);
  }

  // Get the prompt from the modular system
  const systemPrompt = styleDef.getPrompt(language, preserveContent);

  const config = {
    temperature: 0.3,
  };

  try {
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
    // Alert the user with the specific error message
    alert(`Erro na IA: ${error.message || error}`);
    throw error;
  }
};
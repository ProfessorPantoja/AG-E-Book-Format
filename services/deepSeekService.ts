import { StyleId, getStyleById, legacyModeToStyleId } from "./prompts";

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const getApiKey = () => {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) {
        throw new Error("DeepSeek API Key not found. Please add VITE_DEEPSEEK_API_KEY to your .env.local file.");
    }
    return apiKey;
};

export const formatTextWithDeepSeek = async (
    rawTextOrHtml: string,
    mode: StyleId | 'standard' | 'juridical' = 'standard',
    language: 'pt' | 'en' = 'pt',
    preserveContent: boolean = true
): Promise<string> => {
    const apiKey = getApiKey();

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

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat", // or deepseek-reasoner for thinking
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `INPUT CONTENT:\n${rawTextOrHtml}` }
                ],
                temperature: 0.3,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "DeepSeek API Error");
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "<p>Error: No content generated.</p>";
    } catch (error: any) {
        console.error("DeepSeek Formatting error:", error);
        alert(`Erro no DeepSeek: ${error.message || error}`);
        throw error;
    }
};

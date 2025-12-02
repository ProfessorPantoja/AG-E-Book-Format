import { Language } from '../types';

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
    mode: 'standard' | 'juridical' = 'standard',
    language: 'pt' | 'en' = 'pt',
    preserveContent: boolean = true
): Promise<string> => {
    const apiKey = getApiKey();

    const langInstruction = language === 'pt'
        ? "Output everything in Brazilian Portuguese."
        : "Output everything in English.";

    const contentRule = preserveContent
        ? `*** CRITICAL RULE: CONTENT PRESERVATION (LOCKED) ***
       - **DO NOT CHANGE THE TEXT CONTENT.** 
       - Do not rewrite sentences. 
       - Do not summarize. 
       - Do not "improve" the writing style.
       - YOUR JOB IS STRICTLY FORMATTING AND LAYOUT.
       - If the user provided HTML (<b>, <i>, <u>), RESPECT THIS EMPHASIS. You may upgrade <b> to <strong> or a specific class, but DO NOT remove the emphasis the author intended.`
        : `*** CONTENT ENHANCEMENT MODE (UNLOCKED) ***
       - You are allowed to lightly edit the text for clarity, flow, and professional tone.
       - Fix typos and grammar errors.
       - Improve sentence structure if it sounds awkward.
       - BUT maintain the original meaning and key arguments.`;

    let systemPrompt = `
    You are a world-class book designer and editor. Your goal is to take input content (which may contain raw text or basic HTML like bold/italics) and transform it into a "luxury" E-book format using semantic HTML.
    
    ${langInstruction}

    ${contentRule}

    General Rules:
    1. Structure the content logically using <h1> for the main title, <h2> for chapters, <h3> for sections.
    2. Enhance readability:
       - Use <strong> for key terminology or impactful phrases (respecting input bolding).
       - Use blockquote for important quotes or key takeaways.
       - If there is data or list-like information, format it into clear HTML <table> structures or <ul>/<ol> lists.
    3. Return ONLY the HTML body content (do not include <html>, <head>, or <body> tags).
    4. Add classes only if strictly necessary for semantics or specifically requested below.
    5. **IMPORTANT**: Automatically generate a "Table of Contents" (TOC) at the very beginning of the output. 
       - Wrap the TOC in a <div class="toc-container">.
       - Use <h2 class="toc-title">Table of Contents</h2>.
       - Create an unordered list <ul class="toc-list"> with internal links (<a href="#id">) to the headings you generate.
       - Ensure you add corresponding id attributes to your <h2> and <h3> tags (e.g., <h2 id="chapter-1">).
  `;

    if (mode === 'juridical') {
        systemPrompt += `
    
    *** ELITE JURIDICAL & VISUAL ENRICHMENT MODE ACTIVE ***
    - The target audience is high-level legal professionals, judges, and scholars.
    - Formatting must be sober, elegant, and academic.
    - Highlight Latin terms in <em>italics</em>.
    - Use nested lists for clauses and sub-clauses where appropriate.
    
    *** VISUAL ENRICHMENT INSTRUCTIONS (WOW EFFECT) ***
    Even though this is a legal text, you MUST detect opportunities to make it visually engaging without losing professional tone.
    
    1. **DIAGRAMS (Mermaid.js)**:
       - If the text describes a legal process, timeline, or hierarchy, INSERT a Mermaid diagram.
       - Wrap EXACTLY like this: <div class="mermaid">graph TD; A-->B;</div>
       - Use 'graph TD' for processes/flows.
    
    2. **VISUAL COMPONENTS (CSS Classes)**:
       - **Definitions**: <div class="concept-card"><h4>Title</h4><p>Definition...</p></div>
       - **Key Takeaways/Warnings**: <div class="callout-box"><p>Content...</p></div>
       
       - **TIMELINES**: If you detect a sequence of dates or events, format them as:
         <div class="timeline-container">
            <div class="timeline-item">
               <div class="timeline-date">DATE/PERIOD</div>
               <p>Event description...</p>
            </div>
            ...
         </div>

       - **STAT CARDS**: If you detect important monetary values (e.g., "R$ 50.000,00") or percentages, highlight them:
         <div class="stat-card">
            <div class="stat-value">VALUE</div>
            <div class="stat-label">Description</div>
         </div>

       - **COMPARISONS**: If the text compares two concepts (e.g., "CLT vs PJ"), create a table:
         <table class="comparison-table">...</table>

    3. **ANALYSIS**:
       - Look at the input HTML. If the user put something in <b>BOLD</b> or <u>UNDERLINE</u>, it is likely a candidate for a header, a key term, or a Callout Box.
    `;
    }

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

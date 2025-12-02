import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const formatTextToLuxuryHtml = async (
  rawTextOrHtml: string, 
  mode: 'standard' | 'juridical' = 'standard',
  language: 'pt' | 'en' = 'pt'
): Promise<string> => {
  const ai = getClient();
  
  // Use gemini-3-pro-preview for juridical (thinking)
  // Standard uses 2.5 flash
  const model = mode === 'standard' ? "gemini-2.5-flash" : "gemini-3-pro-preview";
  
  const langInstruction = language === 'pt' 
    ? "Output everything in Brazilian Portuguese." 
    : "Output everything in English.";

  let systemPrompt = `
    You are a world-class book designer and editor. Your goal is to take input content (which may contain raw text or basic HTML like bold/italics) and transform it into a "luxury" E-book format using semantic HTML.
    
    ${langInstruction}

    *** CRITICAL RULE: CONTENT PRESERVATION ***
    - **DO NOT CHANGE THE TEXT CONTENT.** 
    - Do not rewrite sentences. 
    - Do not summarize. 
    - Do not "improve" the writing style unless it is a glaring typo.
    - YOUR JOB IS FORMATTING AND LAYOUT, NOT AUTHORING.
    - If the user provided HTML (<b>, <i>, <u>), RESPECT THIS EMPHASIS. You may upgrade <b> to <strong> or a specific class, but DO NOT remove the emphasis the author intended.

    General Rules:
    1. Structure the content logically using <h1> for the main title, <h2> for chapters, <h3> for sections.
    2. Enhance readability:
       - Use <strong> for key terminology or impactful phrases (respecting input bolding).
       - Use <blockquote> for important quotes or key takeaways.
       - If there is data or list-like information, format it into clear HTML <table> structures or <ul>/<ol> lists.
    3. Return ONLY the HTML body content (do not include <html>, <head>, or <body> tags).
    4. Add classes only if strictly necessary for semantics or specifically requested below.
    5. **IMPORTANT**: Automatically generate a "Table of Contents" (TOC) at the very beginning of the output. 
       - Wrap the TOC in a <div class="toc-container">.
       - Use <h2 class="toc-title">Table of Contents</h2>.
       - Create an unordered list <ul class="toc-list"> with internal links (<a href="#id">) to the headings you generate.
       - Ensure you add corresponding id attributes to your <h2> and <h3> tags (e.g., <h2 id="chapter-1">).
  `;

  let config: any = {
    temperature: 0.3,
  };

  if (mode === 'juridical') {
    systemPrompt += `
    
    *** ELITE JURIDICAL & VISUAL ENRICHMENT MODE ACTIVE ***
    - The target audience is high-level legal professionals, judges, and scholars.
    - Formatting must be sober, elegant, and academic.
    - Highlight Latin terms in <em>italics</em>.
    - Use nested lists for clauses and sub-clauses where appropriate.
    
    *** VISUAL ENRICHMENT INSTRUCTIONS ***
    Even though this is a legal text, you MUST detect opportunities to make it visually engaging without losing professional tone.
    
    1. **DIAGRAMS (Mermaid.js)**:
       - If the text describes a legal process, timeline, or hierarchy, INSERT a Mermaid diagram.
       - Wrap EXACTLY like this: <div class="mermaid">graph TD; A-->B;</div>
       - Use 'graph TD' for processes/flows.
    
    2. **VISUAL COMPONENTS**:
       - Detect core definitions or key concepts and wrap them in:
         <div class="concept-card">
           <h4>Title of Concept</h4>
           <p>Definition...</p>
         </div>
       
       - Detect crucial takeaways, warnings, or jurisprudence notes and wrap them in:
         <div class="callout-box">
           <p>Content...</p>
         </div>

    3. **ANALYSIS**:
       - Look at the input HTML. If the user put something in <b>BOLD</b> or <u>UNDERLINE</u>, it is likely a candidate for a header, a key term, or a Callout Box.
    `;
    
    // Enable thinking for complex legal formatting + mermaid generation
    config = {
      thinkingConfig: { thinkingBudget: 32768 },
    };
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n---\nINPUT CONTENT:\n${rawTextOrHtml}` }] }
      ],
      config: config
    });

    return response.text || "<p>Error: No content generated.</p>";
  } catch (error) {
    console.error("Formatting error:", error);
    throw error;
  }
};
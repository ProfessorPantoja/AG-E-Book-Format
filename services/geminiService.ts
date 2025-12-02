import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please add VITE_API_KEY to your .env.local file.");
  }
  return new GoogleGenAI({ apiKey });
};

export const formatTextToLuxuryHtml = async (
  rawTextOrHtml: string,
  mode: 'standard' | 'juridical' = 'standard',
  language: 'pt' | 'en' = 'pt',
  preserveContent: boolean = true
): Promise<string> => {
  const ai = getClient();

  // Use gemini-2.5-flash-preview-09-2025 as requested by user
  const model = "gemini-2.5-flash-preview-09-2025";

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
    You are a world-class book designer and editor specializing in PREMIUM EDITORIAL DESIGN. Your goal is to transform input content into a STUNNING, MAGAZINE-QUALITY E-book that looks like it came from a luxury publishing house.
    
    ${langInstruction}

    ${contentRule}

    *** PREMIUM DESIGN SYSTEM (APPLY TO ALL CONTENT) ***
    
    📐 LAYOUT & SPACING RULES:
    1. **Generous White Space**: Use ample margins and spacing between elements. Never cram content.
    2. **Visual Rhythm**: Alternate between dense text blocks and visual breathing room.
    3. **Hierarchy**: Clear distinction between titles, subtitles, body text, and accents.

    🎨 TYPOGRAPHY & STYLING:
    1. **Chapter Openings**: 
       - Wrap chapter titles in: <div class="chapter-opening"><h2 class="chapter-title">TITLE</h2></div>
       - Add a decorative horizontal rule after: <hr class="decorative-rule">
    
    2. **Drop Caps** (First paragraph of each chapter):
       - <p class="drop-cap-paragraph">First letter should be styled as drop cap...</p>
    
    3. **Pull Quotes** (Extract compelling phrases):
       - <div class="pull-quote">"Extracted compelling quote from the text"</div>
       - Use these to break up long sections and highlight key ideas.
    
    4. **Emphasis Hierarchy**:
       - <strong> for KEY TERMS (sparingly, maximum 2-3 per paragraph)
       - <em> for subtle emphasis, foreign words, or thought emphasis
       - <mark class="highlight"> for CRITICAL concepts that demand attention

    📚 EDITORIAL COMPONENTS:
    
    1. **Section Dividers**:
       - Between major sections: <hr class="section-divider">
       - Between subsections: <hr class="subsection-divider">
    
    2. **Sidebar Notes** (for definitions, examples, or asides):
       <aside class="sidebar-note">
         <h4 class="sidebar-title">Title</h4>
         <p>Content...</p>
       </aside>
    
    3. **Numbered Lists** (for steps, sequences):
       <ol class="styled-list">
         <li><strong>Item title:</strong> Description</li>
       </ol>
    
    4. **Key Takeaways Box**:
       <div class="key-takeaways">
         <h3>Key Takeaways</h3>
         <ul>
           <li>Point 1</li>
           <li>Point 2</li>
         </ul>
       </div>
    
    5. **Visual Callouts** (for important warnings, tips, or notes):
       <div class="callout callout-warning">⚠️ Warning text</div>
       <div class="callout callout-tip">💡 Tip text</div>
       <div class="callout callout-note">📌 Note text</div>

    📖 STRUCTURAL REQUIREMENTS:
    
    1. **Table of Contents** (MANDATORY at start):
       <div class="toc-container">
         <h2 class="toc-title">Table of Contents</h2>
         <ul class="toc-list">
           <li><a href="#chapter-1">Chapter 1: Title</a></li>
         </ul>
       </div>
    
    2. **Chapter Structure**:
       - Each chapter must have: Opening (with drop cap) → Body → Conclusion
       - Insert pull quotes every 3-4 paragraphs in longer chapters
       - Use sidebar notes for supplementary information
    
    3. **Paragraph Formatting**:
       - First paragraph after heading: NO indentation
       - Subsequent paragraphs: Small indentation (class="indented")
       - Maximum 4-5 lines per paragraph for readability

    🎯 DETECTION RULES (Automatically apply when you see):
    
    - **Lists in text** → Convert to styled <ol> or <ul>
    - **Quotes or important phrases** → Extract as pull-quote
    - **Definitions or terms** → Create sidebar-note
    - **Sequential steps** → Numbered styled-list
    - **Warnings/Tips in content** → Callout boxes
    - **Chapter breaks in text** → chapter-opening treatment
    - **Comparisons or contrasts** → Two-column layout table

    ⚡ OUTPUT RULES:
    1. Return ONLY HTML body content (no <html>, <head>, or <body> tags)
    2. Add id attributes to all headings for TOC linking: <h2 id="chapter-name">
    3. Use semantic HTML with the specific classes mentioned above
    4. Maintain the author's voice and content (unless in Enhancement Mode)
    5. Create visual variety: don't let more than 2 pages of pure text go by without a visual element

    🎭 YOUR MISSION:
    Transform this content into something that makes the reader say "WOW, this looks professionally published!" The design should feel PREMIUM, SOPHISTICATED, and INVITING to read.
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

    // Enable thinking for complex legal formatting + mermaid generation
    config = {
      // thinkingConfig removed to avoid quota issues on Free Tier
      temperature: 0.3,
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
  } catch (error: any) {
    console.error("Formatting error:", error);
    // Alert the user with the specific error message
    alert(`Erro na IA: ${error.message || error}`);
    throw error;
  }
};
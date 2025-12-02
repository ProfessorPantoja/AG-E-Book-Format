import React, { useState, useRef, useEffect } from 'react';
import { formatTextToLuxuryHtml } from '../services/geminiService';
import { Sparkles, FileText, Download, Loader2, BookOpen, Scale, ChevronDown, Settings, FileType, Eraser } from 'lucide-react';
import { FontOption, Language, BookMetadata } from '../types';
import { t } from '../i18n';
import { BookSettingsModal } from './BookSettingsModal';

interface TextFormatterProps {
  language: Language;
}

export const TextFormatter: React.FC<TextFormatterProps> = ({ language }) => {
  // We use a contentEditable div, so "inputText" essentially becomes the innerHTML of that div
  const [formattedHtml, setFormattedHtml] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMode, setProcessingMode] = useState<'standard' | 'juridical' | null>(null);
  const [selectedFont, setSelectedFont] = useState<FontOption>('Playfair Display');
  const [showSettings, setShowSettings] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  
  const [metadata, setMetadata] = useState<BookMetadata>({
    title: 'VEREDAS DA EXECUÇÃO TRABALHISTA',
    author: 'ROGÉRIO AMARAL',
    publisher: 'TESTE',
    year: '2025',
    headerText: 'Rogério Amaral',
    footerText: '',
    showPageNumbers: true,
    numberCoverPage: false
  });

  const outputRef = useRef<HTMLDivElement>(null);

  const getEditorContent = () => {
    return editorRef.current?.innerHTML || '';
  };

  const handleFormat = async (mode: 'standard' | 'juridical') => {
    const content = getEditorContent();
    const cleanText = editorRef.current?.innerText || '';
    
    if (!cleanText.trim()) return;

    setIsProcessing(true);
    setProcessingMode(mode);
    setFormattedHtml(null);

    try {
      // Pass the HTML content to preserve bold/italic from Google Docs
      const html = await formatTextToLuxuryHtml(content, mode, language);
      setFormattedHtml(html);
    } catch (err) {
      console.error(err);
      alert(t(language, 'formatter.error'));
    } finally {
      setIsProcessing(false);
      setProcessingMode(null);
    }
  };

  // Render Mermaid diagrams when HTML changes
  useEffect(() => {
    if (formattedHtml && (window as any).mermaid) {
      setTimeout(() => {
        try {
          (window as any).mermaid.init(undefined, document.querySelectorAll('.mermaid'));
        } catch (e) {
          console.warn("Mermaid rendering warning:", e);
        }
      }, 100);
    }
  }, [formattedHtml]);

  const getFullHtmlContent = () => {
    if (!formattedHtml) return "";
    
    // Inject Title Page if metadata exists
    let titlePageHtml = "";
    if (metadata.title || metadata.author) {
      titlePageHtml = `
        <div class="title-page" style="page-break-after: always; min-height: 90vh; display: flex; flex-direction: column; justify-content: center; text-align: center; padding: 4rem 2rem;">
          <h1 style="font-size: 3.5rem; margin-bottom: 2rem; color: #111;">${metadata.title || "Untitled"}</h1>
          <div style="font-size: 1.5rem; color: #555; margin-bottom: 4rem;">${metadata.author}</div>
          
          <div style="margin-top: auto; font-size: 1rem; color: #888;">
             ${metadata.publisher ? `<p>${metadata.publisher}</p>` : ''}
             ${metadata.year ? `<p>${metadata.year}</p>` : ''}
          </div>
        </div>
      `;
    }

    return titlePageHtml + formattedHtml;
  };

  const handleDownloadPdf = () => {
    if (!formattedHtml || !(window as any).html2pdf) return;

    const element = document.createElement('div');
    element.innerHTML = getFullHtmlContent();
    element.style.fontFamily = selectedFont === 'Garamond' ? "'EB Garamond', serif" : 
                               selectedFont === 'Bodoni' ? "'Bodoni Moda', serif" :
                               selectedFont === 'Trajan Pro' ? "'Cinzel', serif" : 
                               "'Playfair Display', serif";
    // Increase internal padding for the PDF generation container to ensure content doesn't touch edges
    element.style.padding = "0"; 
    element.style.maxWidth = "100%";
    
    // Add custom classes for styles
    const style = document.createElement('style');
    style.innerHTML = `
      h1, h2, h3 { color: #111; margin-top: 1.5em; }
      p { margin-bottom: 1em; line-height: 1.6; text-align: justify; }
      blockquote { border-left: 4px solid #d97706; padding-left: 1em; margin: 1em 0; font-style: italic; background: #fafafa; padding: 1em; }
      table { border-collapse: collapse; width: 100%; margin: 1em 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .toc-container { background: #f8fafc; padding: 2rem; margin-bottom: 3rem; border: 1px solid #e2e8f0; border-radius: 8px; }
      .callout-box { background-color: #f0fdf4; border-left: 4px solid #15803d; padding: 1.5rem; margin: 2rem 0; }
      .concept-card { background: white; border: 1px solid #e2e8f0; border-top: 4px solid #d97706; padding: 1.5rem; margin: 1.5rem 0; }
    `;
    element.appendChild(style);
    document.body.appendChild(element);

    const opt = {
      // 25.4mm = 1 inch (standard Word margin)
      margin: [25, 25, 25, 25], 
      filename: `${metadata.title || 'LuxeScript_Ebook'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    (window as any).html2pdf().from(element).set(opt).toPdf().get('pdf').then((pdf: any) => {
      // Add page numbers and footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        // Skip cover page numbering if requested
        if (i === 1 && !metadata.numberCoverPage) continue;
        
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        
        // Footer text
        if (metadata.footerText) {
          pdf.text(metadata.footerText, 25, pdf.internal.pageSize.getHeight() - 15);
        }
        
        // Header text
        if (metadata.headerText) {
           pdf.text(metadata.headerText, 25, 15);
        }

        // Page Number
        if (metadata.showPageNumbers) {
          const pageStr = `${t(language, 'navbar.formatter') === 'Formatador de Texto' ? 'Pág' : 'Page'} ${i} / ${totalPages}`;
          pdf.text(pageStr, pdf.internal.pageSize.getWidth() - 35, pdf.internal.pageSize.getHeight() - 15);
        }
      }
    }).save().then(() => {
      document.body.removeChild(element);
    });
  };

  const handleDownloadHtml = () => {
    if (!formattedHtml) return;
    
    const fontFamilyCss = getFontFamily(selectedFont);
    const fullContent = getFullHtmlContent();
    const element = document.createElement("a");
    const mermaidScript = '<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script><script>document.addEventListener("DOMContentLoaded", function() { mermaid.initialize({ startOnLoad: true, theme: "neutral" }); });</script>';

    const file = new Blob([
      `<html><head><meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Bodoni+Moda:ital,wght@0,400;0,600;0,700;1,400&family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
      ${mermaidScript}
      <style>
        /* Word-like margins for HTML export */
        body { ${fontFamilyCss} line-height: 1.6; max-width: 210mm; margin: 0 auto; padding: 25mm; color: #111; text-align: justify; background-color: white; }
        h1, h2, h3 { color: #111; margin-top: 1.5em; font-family: inherit; text-align: left; }
        blockquote { border-left: 4px solid #d97706; padding-left: 1em; margin: 1em 0; font-style: italic; background: #fafafa; padding: 1em; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .toc-container { background: #f8fafc; padding: 2rem; margin-bottom: 3rem; border: 1px solid #e2e8f0; border-radius: 8px; font-family: 'Inter', sans-serif; text-align: left; }
        .toc-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.5rem; }
        .toc-list { list-style: none; padding-left: 0; }
        .toc-list li { margin-bottom: 0.5rem; }
        .toc-list a { text-decoration: none; color: #475569; }
        .callout-box { background-color: #f0fdf4; border-left: 4px solid #15803d; padding: 1.5rem; margin: 2rem 0; font-family: 'Inter', sans-serif; text-align: left; }
        .concept-card { background: white; border: 1px solid #e2e8f0; border-top: 4px solid #d97706; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); font-family: 'Inter', sans-serif; text-align: left; }
        .mermaid { margin: 2rem 0; text-align: center; }
        .title-page { text-align: center; margin-bottom: 4rem; padding-bottom: 2rem; border-bottom: 1px solid #eee; }
      </style></head><body style="background-color: #f0f0f0;">
        <div style="background-color: white; padding: 25mm; max-width: 210mm; margin: 20px auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">${fullContent}</div>
      </body></html>`
    ], {type: 'text/html'});
    
    element.href = URL.createObjectURL(file);
    element.download = `${metadata.title || "LuxeScript_Ebook"}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getFontFamily = (font: FontOption) => {
    switch (font) {
      case 'Garamond': return "font-family: 'EB Garamond', serif;";
      case 'Bodoni': return "font-family: 'Bodoni Moda', serif;";
      case 'Trajan Pro': return "font-family: 'Cinzel', serif;";
      default: return "font-family: 'Playfair Display', serif;";
    }
  };

  const clearEditor = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setFormattedHtml(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-white">
      <BookSettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        metadata={metadata}
        onChange={setMetadata}
        language={language}
      />

      {/* Input Section */}
      <div className="flex-1 flex flex-col border-r border-slate-200 min-w-0">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-700 font-serif font-medium">
            <FileText size={20} />
            <span>{t(language, 'formatter.title')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={clearEditor}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-500 transition-colors"
              title="Clear text"
            >
              <Eraser size={14} />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
            >
              <Settings size={14} />
              {t(language, 'formatter.buttonSettings')}
            </button>
          </div>
        </div>
        
        {/* Rich Text Editor Simulation */}
        <div 
          ref={editorRef}
          contentEditable
          className="flex-1 p-6 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold-200 text-slate-600 font-serif text-sm leading-relaxed overflow-y-auto rich-editor-content"
          data-placeholder={t(language, 'formatter.placeholder')}
          spellCheck={false}
          style={{ whiteSpace: 'pre-wrap' }}
        />

        <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => handleFormat('standard')}
            disabled={isProcessing}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
              isProcessing
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-gold-50 hover:bg-slate-800 shadow-lg shadow-slate-200'
            }`}
          >
            {isProcessing && processingMode === 'standard' ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Sparkles size={18} className="text-gold-400" />
            )}
            <span className="font-serif text-sm">{t(language, 'formatter.buttonStandard')}</span>
          </button>

          <button
            onClick={() => handleFormat('juridical')}
            disabled={isProcessing}
            className={`flex-1 min-w-[200px] py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all relative overflow-hidden group ${
              isProcessing
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-gold-200 border border-gold-500/30 hover:shadow-[0_0_15px_rgba(217,119,6,0.3)]'
            }`}
          >
            {isProcessing && processingMode === 'juridical' ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Scale size={18} className="text-gold-300" />
            )}
             <span className="font-serif text-sm tracking-wide">{t(language, 'formatter.buttonJuridical')}</span>
             <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12"></div>
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="flex-1 flex flex-col bg-slate-100 min-w-0">
         <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-2 text-gold-700 font-serif font-medium">
            <BookOpen size={20} />
            <span>{t(language, 'formatter.previewTitle')}</span>
          </div>
          
          <div className="flex items-center gap-2">
             {/* Font Selector */}
             <div className="relative group mr-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md cursor-pointer hover:bg-slate-100 transition-colors">
                  <span className="font-serif">{selectedFont}</span>
                  <ChevronDown size={14} />
                </div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 hidden group-hover:block z-50">
                  {(['Playfair Display', 'Garamond', 'Bodoni', 'Trajan Pro'] as FontOption[]).map((font) => (
                    <button
                      key={font}
                      onClick={() => setSelectedFont(font)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${selectedFont === font ? 'text-gold-600 font-medium' : 'text-slate-600'}`}
                      style={{ 
                        fontFamily: font === 'Garamond' ? 'EB Garamond' : font === 'Bodoni' ? 'Bodoni Moda' : font === 'Trajan Pro' ? 'Cinzel' : 'Playfair Display'
                      }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
             </div>

            <button
               onClick={handleDownloadPdf}
               disabled={!formattedHtml}
               className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md transition-colors ${
                  !formattedHtml ? 'text-slate-300' : 'bg-red-50 text-red-700 hover:bg-red-100'
               }`}
               title="Download PDF"
            >
              <FileType size={16} />
              <span className="hidden sm:inline">PDF</span>
            </button>
            
            <button
               onClick={handleDownloadHtml}
               disabled={!formattedHtml}
               className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md transition-colors ${
                  !formattedHtml ? 'text-slate-300' : 'bg-slate-50 text-slate-700 hover:bg-slate-200'
               }`}
               title="Export HTML"
            >
              <Download size={16} />
              <span className="hidden sm:inline">HTML</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-100 relative">
            {!formattedHtml && !isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 select-none pointer-events-none">
                 <BookOpen size={64} className="mb-4 opacity-20" />
                 <p className="font-serif text-lg italic opacity-50">{t(language, 'formatter.emptyState')}</p>
              </div>
            )}
            
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
                  </div>
                  <p className="font-serif text-slate-600 font-medium animate-pulse">
                    {processingMode === 'juridical' ? t(language, 'formatter.thinking') : t(language, 'formatter.processing')}
                  </p>
                </div>
              </div>
            )}

            {formattedHtml && (
              <div 
                ref={outputRef}
                className="preview-content mx-auto shadow-2xl shadow-slate-300/50 bg-white"
                style={{ 
                  // Mimic A4 Paper dimensions and margins
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '25.4mm', // 1 inch margin
                  boxSizing: 'border-box',
                  fontFamily: selectedFont === 'Garamond' ? "'EB Garamond', serif" : 
                              selectedFont === 'Bodoni' ? "'Bodoni Moda', serif" :
                              selectedFont === 'Trajan Pro' ? "'Cinzel', serif" : 
                              "'Playfair Display', serif",
                  textAlign: 'justify'
                }}
              >
                {/* Visual Title Page for Preview */}
                {(metadata.title || metadata.author) && (
                  <div className="mb-16 text-center border-b pb-8 border-slate-100 page-break-after">
                     <h1 className="text-5xl font-bold mb-4 text-slate-900">{metadata.title}</h1>
                     <p className="text-xl text-slate-600 mb-8">{metadata.author}</p>
                     <div className="text-sm text-slate-400">
                        {metadata.publisher && <span className="mr-4">{metadata.publisher}</span>}
                        {metadata.year && <span>{metadata.year}</span>}
                     </div>
                  </div>
                )}
                
                <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
                
                {/* Visual Footer for Preview */}
                {(metadata.footerText || metadata.showPageNumbers) && (
                   <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                      <span>{metadata.footerText}</span>
                      {metadata.showPageNumbers && <span>1 / 1 (Preview)</span>}
                   </div>
                )}
              </div>
            )}
        </div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0%); }
          100% { width: 100%; transform: translateX(100%); }
        }
        /* Ensure images and tables don't overflow the A4 width */
        .preview-content img, .preview-content table, .preview-content .mermaid {
          max-width: 100%;
        }
      `}</style>
    </div>
  );
};
import { BookMetadata, FontOption, Language } from '../types';
import { t } from '../i18n';

export const generatePdf = (
    htmlContent: string,
    metadata: BookMetadata,
    selectedFont: FontOption,
    language: Language
) => {
    if (!htmlContent || !(window as any).html2pdf) return;

    const getFontFamily = (font: FontOption) => {
        switch (font) {
            case 'Garamond': return "'EB Garamond', serif";
            case 'Bodoni': return "'Bodoni Moda', serif";
            case 'Trajan Pro': return "'Cinzel', serif";
            default: return "'Playfair Display', serif";
        }
    };

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

    const fullContent = titlePageHtml + htmlContent;

    const element = document.createElement('div');
    element.innerHTML = fullContent;
    element.style.fontFamily = getFontFamily(selectedFont);
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
    
    /* New Visual Elements */
    .timeline-container { border-left: 2px solid #d97706; margin-left: 1rem; padding-left: 2rem; margin-top: 2rem; margin-bottom: 2rem; }
    .timeline-item { position: relative; margin-bottom: 1.5rem; }
    .timeline-item::before { content: ''; position: absolute; left: -2.4rem; top: 0.4rem; width: 0.8rem; height: 0.8rem; background: #d97706; border-radius: 50%; }
    .timeline-date { font-weight: bold; color: #d97706; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
    
    .stat-card { background: #1e293b; color: #f8fafc; padding: 2rem; border-radius: 8px; text-align: center; margin: 2rem 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
    .stat-value { font-size: 3rem; font-weight: 700; color: #fbbf24; line-height: 1; margin-bottom: 0.5rem; }
    .stat-label { font-size: 1rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8; }
    
    .comparison-table { width: 100%; border: none; margin: 2rem 0; }
    .comparison-table th { background: #0f172a; color: white; border: none; padding: 1rem; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em; }
    .comparison-table td { border-bottom: 1px solid #e2e8f0; padding: 1rem; vertical-align: top; }
    .comparison-table tr:last-child td { border-bottom: none; }
  `;
    element.appendChild(style);
    document.body.appendChild(element);

    const opt = {
        margin: [25, 25, 25, 25],
        filename: `${metadata.title || 'LuxeScript_Ebook'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    (window as any).html2pdf().from(element).set(opt).toPdf().get('pdf').then((pdf: any) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 && !metadata.numberCoverPage) continue;

            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(150);

            if (metadata.footerText) {
                pdf.text(metadata.footerText, 25, pdf.internal.pageSize.getHeight() - 15);
            }

            if (metadata.headerText) {
                pdf.text(metadata.headerText, 25, 15);
            }

            if (metadata.showPageNumbers) {
                const pageStr = `${t(language, 'navbar.formatter') === 'Formatador de Texto' ? 'Pág' : 'Page'} ${i} / ${totalPages}`;
                pdf.text(pageStr, pdf.internal.pageSize.getWidth() - 35, pdf.internal.pageSize.getHeight() - 15);
            }
        }
    }).save().then(() => {
        document.body.removeChild(element);
    });
};

export const downloadHtml = (
    htmlContent: string,
    metadata: BookMetadata,
    selectedFont: FontOption
) => {
    if (!htmlContent) return;

    const getFontFamily = (font: FontOption) => {
        switch (font) {
            case 'Garamond': return "font-family: 'EB Garamond', serif;";
            case 'Bodoni': return "font-family: 'Bodoni Moda', serif;";
            case 'Trajan Pro': return "font-family: 'Cinzel', serif;";
            default: return "font-family: 'Playfair Display', serif;";
        }
    };

    const fontFamilyCss = getFontFamily(selectedFont);

    // Inject Title Page
    let titlePageHtml = "";
    if (metadata.title || metadata.author) {
        titlePageHtml = `
        <div class="title-page">
            <h1>${metadata.title || "Untitled"}</h1>
            <div>${metadata.author}</div>
            <div style="margin-top: 4rem; font-size: 1rem; color: #888;">
                ${metadata.publisher ? `<p>${metadata.publisher}</p>` : ''}
                ${metadata.year ? `<p>${metadata.year}</p>` : ''}
            </div>
        </div>
        `;
    }

    const fullContent = titlePageHtml + htmlContent;
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
        
        /* New Visual Elements */
        .timeline-container { border-left: 2px solid #d97706; margin-left: 1rem; padding-left: 2rem; margin-top: 2rem; margin-bottom: 2rem; }
        .timeline-item { position: relative; margin-bottom: 1.5rem; }
        .timeline-item::before { content: ''; position: absolute; left: -2.4rem; top: 0.4rem; width: 0.8rem; height: 0.8rem; background: #d97706; border-radius: 50%; }
        .timeline-date { font-weight: bold; color: #d97706; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .stat-card { background: #1e293b; color: #f8fafc; padding: 2rem; border-radius: 8px; text-align: center; margin: 2rem 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .stat-value { font-size: 3rem; font-weight: 700; color: #fbbf24; line-height: 1; margin-bottom: 0.5rem; }
        .stat-label { font-size: 1rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8; }
        
        .comparison-table { width: 100%; border: none; margin: 2rem 0; }
        .comparison-table th { background: #0f172a; color: white; border: none; padding: 1rem; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em; }
        .comparison-table td { border-bottom: 1px solid #e2e8f0; padding: 1rem; vertical-align: top; }
        .comparison-table tr:last-child td { border-bottom: none; }
      </style></head><body style="background-color: #f0f0f0;">
        <div style="background-color: white; padding: 25mm; max-width: 210mm; margin: 20px auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">${fullContent}</div>
      </body></html>`
    ], { type: 'text/html' });

    element.href = URL.createObjectURL(file);
    element.download = `${metadata.title || "LuxeScript_Ebook"}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

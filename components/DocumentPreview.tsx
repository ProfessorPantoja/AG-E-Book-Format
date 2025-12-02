import React, { useEffect, useRef } from 'react';
import { BookMetadata, FontOption, Language } from '../types';
import { t } from '../i18n';
import { BookOpen, Loader2 } from 'lucide-react';

interface DocumentPreviewProps {
    html: string | null;
    metadata: BookMetadata;
    selectedFont: FontOption;
    language: Language;
    isProcessing: boolean;
    processingMode: 'standard' | 'juridical' | null;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
    html,
    metadata,
    selectedFont,
    language,
    isProcessing,
    processingMode
}) => {
    const outputRef = useRef<HTMLDivElement>(null);

    // Initialize Mermaid diagrams when HTML changes
    useEffect(() => {
        if (html && (window as any).mermaid) {
            setTimeout(() => {
                try {
                    (window as any).mermaid.init(undefined, document.querySelectorAll('.mermaid'));
                } catch (e) {
                    console.warn("Mermaid rendering warning:", e);
                }
            }, 100);
        }
    }, [html]);

    const getFontFamily = (font: FontOption) => {
        switch (font) {
            case 'Garamond': return "'EB Garamond', serif";
            case 'Bodoni': return "'Bodoni Moda', serif";
            case 'Trajan Pro': return "'Cinzel', serif";
            default: return "'Playfair Display', serif";
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-100 relative">
            {!html && !isProcessing && (
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

            {html && (
                <div
                    ref={outputRef}
                    className="preview-content mx-auto shadow-2xl shadow-slate-300/50 bg-white"
                    style={{
                        // Mimic A4 Paper dimensions and margins
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '25.4mm', // 1 inch margin
                        boxSizing: 'border-box',
                        fontFamily: getFontFamily(selectedFont),
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

                    <div dangerouslySetInnerHTML={{ __html: html }} />

                    {/* Visual Footer for Preview */}
                    {(metadata.footerText || metadata.showPageNumbers) && (
                        <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                            <span>{metadata.footerText}</span>
                            {metadata.showPageNumbers && <span>1 / 1 (Preview)</span>}
                        </div>
                    )}
                </div>
            )}

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

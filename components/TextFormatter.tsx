import React, { useState, useRef } from 'react';
import { formatTextToLuxuryHtml } from '../services/geminiService';
import { formatTextWithDeepSeek } from '../services/deepSeekService';
import { Sparkles, FileText, Settings, Eraser, Scale, Loader2, Lock, Unlock, BookOpen, Bot, ChevronDown, Layout, Feather, Terminal } from 'lucide-react';
import { FontOption, Language, BookMetadata } from '../types';
import { StyleId } from '../services/prompts';
import { t } from '../i18n';
import { BookSettingsModal } from './BookSettingsModal';
import { RichTextEditor } from './RichTextEditor';
import { DocumentPreview } from './DocumentPreview';
import { generatePdf, downloadHtml } from '../services/pdfService';

interface TextFormatterProps {
  language: Language;
}

export const TextFormatter: React.FC<TextFormatterProps> = ({ language }) => {
  const [editorHtml, setEditorHtml] = useState<string>('');
  const [editorText, setEditorText] = useState<string>('');
  const [formattedHtml, setFormattedHtml] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMode, setProcessingMode] = useState<StyleId | 'standard' | 'juridical' | null>(null);
  const [selectedFont, setSelectedFont] = useState<FontOption>('Playfair Display');
  const [showSettings, setShowSettings] = useState(false);
  const [preserveContent, setPreserveContent] = useState(true);
  const [provider, setProvider] = useState<'gemini' | 'deepseek'>('gemini');
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);

  const [metadata, setMetadata] = useState<BookMetadata>({
    title: 'VEREDAS DA EXECUÇÃO TRABALHISTA',
    author: 'ROGÉRIO AMARAL',
    publisher: 'Editora Pantoja',
    year: '2025',
    headerText: 'Rogério Amaral',
    footerText: '',
    showPageNumbers: true,
    numberCoverPage: false
  });

  const handleFormat = async (mode: StyleId | 'standard' | 'juridical') => {
    if (!editorText.trim()) return;

    setIsProcessing(true);
    setProcessingMode(mode);
    setFormattedHtml(null);

    try {
      let html = "";
      if (provider === 'gemini') {
        html = await formatTextToLuxuryHtml(editorHtml, mode, language, preserveContent);
      } else {
        html = await formatTextWithDeepSeek(editorHtml, mode, language, preserveContent);
      }
      setFormattedHtml(html);
    } catch (err) {
      console.error(err);
      // Alert is handled in service
    } finally {
      setIsProcessing(false);
      setProcessingMode(null);
    }
  };

  const handleEditorChange = (html: string, text: string) => {
    setEditorHtml(html);
    setEditorText(text);
  };

  const clearEditor = () => {
    setEditorHtml('');
    setEditorText('');
    setFormattedHtml(null);
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
            {/* Provider Selector */}
            <div className="flex items-center bg-white border border-slate-200 rounded-md p-1 mr-2">
              <button
                onClick={() => setProvider('gemini')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${provider === 'gemini' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
                title="Google Gemini"
              >
                <Sparkles size={12} /> Gemini
              </button>
              <button
                onClick={() => setProvider('deepseek')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${provider === 'deepseek' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                title="DeepSeek V3"
              >
                <Bot size={12} /> DeepSeek
              </button>
            </div>

            <button
              onClick={() => setPreserveContent(!preserveContent)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded transition-colors ${preserveContent
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              title={preserveContent ? "Conteúdo Bloqueado (IA não reescreve)" : "Conteúdo Livre (IA pode melhorar texto)"}
            >
              {preserveContent ? <Lock size={14} /> : <Unlock size={14} />}
              {preserveContent ? "Manter" : "Editar"}
            </button>

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
            </button>
          </div>
        </div>

        <RichTextEditor
          language={language}
          onChange={handleEditorChange}
          initialContent={editorHtml}
        />

        <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => handleFormat('standard')}
            disabled={isProcessing}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${isProcessing
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
            className={`flex-1 min-w-[200px] py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all relative overflow-hidden group ${isProcessing
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

          {/* New Styles Dropdown */}
          <div className="relative">
            <button
              disabled={isProcessing}
              onClick={() => setShowStyleDropdown(!showStyleDropdown)}
              className={`h-full px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all border ${isProcessing
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-gold-300 hover:text-gold-700'
                }`}
            >
              <span className="font-serif text-sm">Outros Estilos</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${showStyleDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showStyleDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowStyleDropdown(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      handleFormat('magazine-modern');
                      setShowStyleDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-50"
                  >
                    <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Layout size={16} />
                    </div>
                    <div>
                      <div className="font-serif font-medium text-slate-800">Magazine Modern</div>
                      <div className="text-xs text-slate-500">Visual ousado e moderno</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      handleFormat('minimalist-zen');
                      setShowStyleDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-50"
                  >
                    <div className="w-8 h-8 rounded bg-stone-100 text-stone-600 flex items-center justify-center">
                      <Feather size={16} />
                    </div>
                    <div>
                      <div className="font-serif font-medium text-slate-800">Minimalist Zen</div>
                      <div className="text-xs text-slate-500">Limpo, foco no texto</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      handleFormat('tech-manual');
                      setShowStyleDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Terminal size={16} />
                    </div>
                    <div>
                      <div className="font-serif font-medium text-slate-800">Tech Manual</div>
                      <div className="text-xs text-slate-500">Para documentação técnica</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
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
              onClick={() => generatePdf(formattedHtml || '', metadata, selectedFont, language)}
              disabled={!formattedHtml}
              className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md transition-colors ${!formattedHtml ? 'text-slate-300' : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              title="Download PDF"
            >
              <FileText size={16} />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              onClick={() => downloadHtml(formattedHtml || '', metadata, selectedFont)}
              disabled={!formattedHtml}
              className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md transition-colors ${!formattedHtml ? 'text-slate-300' : 'bg-slate-50 text-slate-700 hover:bg-slate-200'
                }`}
              title="Export HTML"
            >
              <FileText size={16} />
              <span className="hidden sm:inline">HTML</span>
            </button>
          </div>
        </div>

        <DocumentPreview
          html={formattedHtml}
          metadata={metadata}
          selectedFont={selectedFont}
          language={language}
          isProcessing={isProcessing}
          processingMode={processingMode}
        />
      </div>
    </div>
  );
};
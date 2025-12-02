import React, { useRef, useEffect } from 'react';
import { t } from '../i18n';
import { Language } from '../types';

interface RichTextEditorProps {
  language: Language;
  initialContent?: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  language, 
  initialContent = '', 
  onChange,
  placeholder 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && initialContent && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText;
      onChange(html, text);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // We want to allow default paste behavior to preserve HTML (bold, italic) from Word/Docs
    // But we might want to clean up messy styles later. For now, let browser handle it 
    // to ensure we get the <b> and <i> tags.
    // If we needed to strip specific things, we would do it here.
    setTimeout(handleInput, 0);
  };

  return (
    <div 
      ref={editorRef}
      contentEditable
      onInput={handleInput}
      onPaste={handlePaste}
      className="flex-1 p-6 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold-200 text-slate-600 font-serif text-sm leading-relaxed overflow-y-auto rich-editor-content"
      data-placeholder={placeholder || t(language, 'formatter.placeholder')}
      spellCheck={false}
      style={{ whiteSpace: 'pre-wrap' }}
    />
  );
};

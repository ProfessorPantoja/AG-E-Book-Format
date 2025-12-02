import React from 'react';
import { BookMetadata, Language } from '../types';
import { t } from '../i18n';
import { X } from 'lucide-react';

interface BookSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: BookMetadata;
  onChange: (metadata: BookMetadata) => void;
  language: Language;
}

export const BookSettingsModal: React.FC<BookSettingsModalProps> = ({ 
  isOpen, onClose, metadata, onChange, language 
}) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof BookMetadata, value: any) => {
    onChange({ ...metadata, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-gold-500/30">
          <h3 className="text-gold-400 font-serif text-xl">{t(language, 'settings.title')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Metadata Section */}
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{t(language, 'settings.metadata')}</h4>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t(language, 'settings.bookTitle')}</label>
                <input 
                  type="text" 
                  value={metadata.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t(language, 'settings.author')}</label>
                  <input 
                    type="text" 
                    value={metadata.author}
                    onChange={(e) => handleChange('author', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t(language, 'settings.year')}</label>
                  <input 
                    type="text" 
                    value={metadata.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t(language, 'settings.publisher')}</label>
                <input 
                  type="text" 
                  value={metadata.publisher}
                  onChange={(e) => handleChange('publisher', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Layout Section */}
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{t(language, 'settings.layout')}</h4>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t(language, 'settings.headerText')}</label>
                <input 
                  type="text" 
                  value={metadata.headerText}
                  onChange={(e) => handleChange('headerText', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                  placeholder="e.g. Confidential Draft"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t(language, 'settings.footerText')}</label>
                <input 
                  type="text" 
                  value={metadata.footerText}
                  onChange={(e) => handleChange('footerText', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                  placeholder="e.g. All rights reserved"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">{t(language, 'settings.pageNumbers')} (Page X of Y)</span>
                <button 
                  onClick={() => handleChange('showPageNumbers', !metadata.showPageNumbers)}
                  className={`relative w-11 h-6 transition rounded-full ${metadata.showPageNumbers ? 'bg-gold-500' : 'bg-slate-300'}`}
                >
                  <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${metadata.showPageNumbers ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-gold-400 rounded hover:bg-slate-800 font-medium"
          >
            {t(language, 'settings.close')}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
import React from 'react';
import { AppMode, Language } from '../types';
import { BookText, PenTool } from 'lucide-react';
import { t } from '../i18n';

interface NavbarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentMode, onModeChange, language, onLanguageChange }) => {
  return (
    <nav className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-12 shadow-sm relative z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-gold-400 shadow-lg shadow-slate-200">
          <PenTool size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">LuxeScript<span className="text-gold-500">.</span></h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">{t(language, 'navbar.subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => onModeChange(AppMode.FORMATTER)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all text-sm font-medium ${
            currentMode === AppMode.FORMATTER
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookText size={18} />
          <span>{t(language, 'navbar.formatter')}</span>
        </button>
      </div>

      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center bg-slate-50 rounded-full border border-slate-200 p-1">
           <button 
             onClick={() => onLanguageChange('pt')}
             className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'pt' ? 'bg-slate-900 text-gold-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
           >
             PT
           </button>
           <button 
             onClick={() => onLanguageChange('en')}
             className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-slate-900 text-gold-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
           >
             EN
           </button>
        </div>
        
        <span className="text-xs font-medium text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-100">
          {t(language, 'navbar.pro')}
        </span>
      </div>
    </nav>
  );
};
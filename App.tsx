import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TextFormatter } from './components/TextFormatter';
import { AppMode, Language } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.FORMATTER);
  // Default to Portuguese as requested ("TODOS TEXTO... EM PORTUGES DO BRASIL")
  const [language, setLanguage] = useState<Language>('pt');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar 
        currentMode={mode} 
        onModeChange={setMode} 
        language={language}
        onLanguageChange={setLanguage}
      />
      
      <main className="flex-1 relative">
         <TextFormatter language={language} />
      </main>
    </div>
  );
};

export default App;
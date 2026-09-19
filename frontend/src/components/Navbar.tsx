import React from 'react';
import { translations, Language } from '../i18n/translations';
import { ShieldCheck, Activity, MessageSquare } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'citizen' | 'admin';
  setCurrentView: (v: 'landing' | 'citizen' | 'admin') => void;
  lang: Language;
  setLang: (l: Language) => void;
  onTriggerSimulation: () => void;
  isSimulating: boolean;
  onToggleAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  lang,
  setLang,
  onTriggerSimulation,
  isSimulating,
  onToggleAssistant
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div 
          onClick={() => setCurrentView('landing')} 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-base sm:text-xl shadow-inner group-hover:bg-emerald-500 transition-colors">
            JS
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-lg tracking-wider text-white">JANSETU AI</span>
              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-mono hidden md:inline-block">
                GovTech MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden lg:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Center navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentView('citizen')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
              currentView === 'citizen'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="hidden sm:inline">{t.reportProblem}</span>
            <span className="sm:hidden">{lang === 'hi' ? 'शिकायत' : 'Report'}</span>
          </button>

          <button
            onClick={() => setCurrentView('admin')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-1.5 ${
              currentView === 'admin'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300" />
            <span className="hidden sm:inline">{t.adminDashboard}</span>
            <span className="sm:hidden">{lang === 'hi' ? 'प्रशासन' : 'Admin'}</span>
          </button>
        </nav>

        {/* Right action controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={onTriggerSimulation}
            disabled={isSimulating}
            title="Simulate incoming citizen distress reports to demonstrate live AI re-scoring"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 text-amber-400 ${isSimulating ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">{t.liveDemo}</span>
            <span className="hidden sm:inline lg:hidden">Simulate</span>
          </button>

          <button
            onClick={onToggleAssistant}
            className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="JanSetu Intelligence Assistant"
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </button>

          <div className="flex items-center rounded-md bg-slate-800 border border-slate-700 p-0.5 text-xs">
            <button
              onClick={() => setLang('en')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs ${
                lang === 'en' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs ${
                lang === 'hi' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              HI
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

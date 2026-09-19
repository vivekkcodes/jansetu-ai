import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { CitizenPortal } from './pages/CitizenPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { AssistantDrawer } from './components/AssistantDrawer';
import { Language } from './i18n/translations';
import { api } from './services/api';
import { Bot } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'citizen' | 'admin'>('landing');
  const [adminTab, setAdminTab] = useState<any>('overview');
  const [lang, setLang] = useState<Language>('en');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigate = (view: 'landing' | 'citizen' | 'admin', tab?: any) => {
    if (tab && view === 'admin') {
      setAdminTab(tab);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await api.triggerSimulation(5);
      alert(
        "⚡ Live Simulation Triggered!\n\n" +
        "• Ingested 5 new emergency citizen distress reports.\n" +
        "• Updated Hotspot " + res.affected_cluster.cluster_code + " (" + res.affected_cluster.title + ").\n" +
        "• New report count: " + res.affected_cluster.new_report_count + " reports.\n" +
        "• Recalculated Priority Score: " + res.affected_cluster.new_priority_score + " (Delta: +" + res.affected_cluster.score_delta + ").\n\n" +
        "The intelligence dashboard has been refreshed live!"
      );
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      alert('Simulation trigger failed. Please verify backend service.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans relative">
      <Navbar
        currentView={currentView}
        setCurrentView={(v) => handleNavigate(v)}
        lang={lang}
        setLang={setLang}
        onTriggerSimulation={handleTriggerSimulation}
        isSimulating={isSimulating}
        onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
      />

      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            lang={lang}
            onTriggerSimulation={handleTriggerSimulation}
            isSimulating={isSimulating}
          />
        )}

        {currentView === 'citizen' && (
          <CitizenPortal
            lang={lang}
            onNavigateToDashboard={() => handleNavigate('admin')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            key={refreshKey}
            lang={lang}
            initialTab={adminTab}
            onOpenAssistant={() => setIsAssistantOpen(true)}
            onTriggerSimulation={handleTriggerSimulation}
            isSimulating={isSimulating}
          />
        )}
      </div>

      {/* Persistent Floating Chat with AI Button */}
      {!isAssistantOpen && (
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-blue-600/40 flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-blue-400/30"
          title="Chat with JanSetu AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="hidden sm:inline text-xs font-bold tracking-wide">
            {lang === 'hi' ? 'JanSetu AI से पूछें' : 'Chat with AI'}
          </span>
        </button>
      )}

      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        selectedDistrict="All"
        lang={lang}
      />
    </div>
  );
}

export default App;

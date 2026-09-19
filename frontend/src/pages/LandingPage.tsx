import React, { useState } from 'react';
import { translations, Language } from '../i18n/translations';
import { 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Mic, 
  FileText, 
  Camera, 
  BarChart3, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  Cpu,
  Activity,
  ChevronRight,
  ExternalLink,
  Zap,
  Check
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: 'citizen' | 'admin', tab?: string) => void;
  lang: Language;
  onTriggerSimulation?: () => void;
  isSimulating?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigate, 
  lang,
  onTriggerSimulation,
  isSimulating = false
}) => {
  const t = translations[lang];
  const [selectedStep, setSelectedStep] = useState<number>(1);

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Civic AI Intelligence Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            JANSETU AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
              "{t.tagline}"
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 font-normal mb-10 leading-relaxed">
            {t.subtagline}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('citizen')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Mic className="w-5 h-5 text-emerald-100" />
              {t.reportProblem}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('admin', 'overview')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-base transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <BarChart3 className="w-5 h-5 text-blue-400" />
              {t.viewIntelligence}
            </button>
          </div>

          {/* Stats strip - Fully Clickable to respective Admin tabs */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div 
              onClick={() => onNavigate('admin', 'reports')}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-800 cursor-pointer transition-all duration-200 text-center group transform hover:-translate-y-1"
              title="Click to explore all 5,280+ citizen reports"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 group-hover:scale-105 transition-transform">5,280+</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wide flex items-center justify-center gap-1">
                Aggregated Reports <ChevronRight className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div 
              onClick={() => onNavigate('admin', 'map')}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-800 cursor-pointer transition-all duration-200 text-center group transform hover:-translate-y-1"
              title="Click to view interactive GIS Hotspot Map"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 group-hover:scale-105 transition-transform">37</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wide flex items-center justify-center gap-1">
                Active Hotspots <ChevronRight className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div 
              onClick={() => onNavigate('admin', 'settings')}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-800 cursor-pointer transition-all duration-200 text-center group transform hover:-translate-y-1"
              title="Click to view transparent 6-factor priority engine"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 group-hover:scale-105 transition-transform">92.4 / 100</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wide flex items-center justify-center gap-1">
                Max Priority Index <ChevronRight className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div 
              onClick={() => onNavigate('admin', 'gaps')}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-800 cursor-pointer transition-all duration-200 text-center group transform hover:-translate-y-1"
              title="Click to view infrastructure gap analysis"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 group-hover:scale-105 transition-transform">8,420</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wide flex items-center justify-center gap-1">
                Top Gap Population <ChevronRight className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow Architecture Flow - Fully Interactive */}
      <section className="py-16 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-3">
              <span>Interactive Pipeline</span>
              <span className="text-emerald-400 font-bold">• Click any card to inspect or test</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              The Intelligence Pipeline
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Transforming unstructured citizen voice into geographically grounded public infrastructure investments.
            </p>
          </div>

          {/* 5 Interactive Pipeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            {/* Step 1 */}
            <div 
              onClick={() => setSelectedStep(1)}
              className={`p-5 rounded-xl transition-all duration-200 flex flex-col items-center text-center cursor-pointer transform hover:-translate-y-1 ${
                selectedStep === 1 
                  ? 'bg-slate-800/90 border-2 border-emerald-500 shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-500/20' 
                  : 'bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 mb-4 shadow-sm">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold mb-1">01. INGESTION</span>
              <h3 className="font-bold text-white text-sm mb-2">Citizen Voices</h3>
              <p className="text-xs text-slate-400 mb-4 flex-1">Multilingual voice, conversational text, and photo evidence via Web Speech.</p>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('citizen');
                }}
                className="w-full py-1.5 px-2.5 rounded-md text-xs font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/40 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Report Voice/Text</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Step 2 */}
            <div 
              onClick={() => setSelectedStep(2)}
              className={`p-5 rounded-xl transition-all duration-200 flex flex-col items-center text-center cursor-pointer transform hover:-translate-y-1 ${
                selectedStep === 2 
                  ? 'bg-slate-800/90 border-2 border-blue-500 shadow-xl shadow-blue-950/50 ring-2 ring-blue-500/20' 
                  : 'bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-950 border border-blue-700/50 flex items-center justify-center text-blue-400 mb-4 shadow-sm">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-blue-400 font-bold mb-1">02. EXTRACTION</span>
              <h3 className="font-bold text-white text-sm mb-2">AI Understanding</h3>
              <p className="text-xs text-slate-400 mb-4 flex-1">Translates Hindi/dialects, categorizes issues, and scores physical severity.</p>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('admin', 'reports');
                }}
                className="w-full py-1.5 px-2.5 rounded-md text-xs font-semibold bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/40 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View AI Reports</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Step 3 */}
            <div 
              onClick={() => setSelectedStep(3)}
              className={`p-5 rounded-xl transition-all duration-200 flex flex-col items-center text-center cursor-pointer transform hover:-translate-y-1 ${
                selectedStep === 3 
                  ? 'bg-slate-800/90 border-2 border-amber-500 shadow-xl shadow-amber-950/50 ring-2 ring-amber-500/20' 
                  : 'bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-amber-950 border border-amber-700/50 flex items-center justify-center text-amber-400 mb-4 shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold mb-1">03. SPATIAL ML</span>
              <h3 className="font-bold text-white text-sm mb-2">Hotspot Clustering</h3>
              <p className="text-xs text-slate-400 mb-4 flex-1">DBSCAN + TF-IDF groups hundreds of reports into geographic issue clusters.</p>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('admin', 'map');
                }}
                className="w-full py-1.5 px-2.5 rounded-md text-xs font-semibold bg-amber-600/20 text-amber-300 hover:bg-amber-600 hover:text-white border border-amber-500/40 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Explore GIS Map</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Step 4 */}
            <div 
              onClick={() => setSelectedStep(4)}
              className={`p-5 rounded-xl transition-all duration-200 flex flex-col items-center text-center cursor-pointer transform hover:-translate-y-1 ${
                selectedStep === 4 
                  ? 'bg-slate-800/90 border-2 border-purple-500 shadow-xl shadow-purple-950/50 ring-2 ring-purple-500/20' 
                  : 'bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-850'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-purple-950 border border-purple-700/50 flex items-center justify-center text-purple-400 mb-4 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-purple-400 font-bold mb-1">04. FORMULA</span>
              <h3 className="font-bold text-white text-sm mb-2">Priority Engine</h3>
              <p className="text-xs text-slate-400 mb-4 flex-1">Transparent 6-factor mathematical score with explainability checklist.</p>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('admin', 'settings');
                }}
                className="w-full py-1.5 px-2.5 rounded-md text-xs font-semibold bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/40 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Adjust Weights</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Step 5 */}
            <div 
              onClick={() => setSelectedStep(5)}
              className={`p-5 rounded-xl transition-all duration-200 flex flex-col items-center text-center cursor-pointer transform hover:-translate-y-1 ${
                selectedStep === 5 
                  ? 'bg-slate-800/90 border-2 border-rose-500 shadow-xl shadow-rose-950/50 ring-2 ring-rose-500/20' 
                  : 'bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-850'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-rose-950 border border-rose-700/50 flex items-center justify-center text-rose-400 mb-4 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-rose-400 font-bold mb-1">05. GOVERNANCE</span>
              <h3 className="font-bold text-white text-sm mb-2">Action Tracking</h3>
              <p className="text-xs text-slate-400 mb-4 flex-1">Converts AI recommendations into tracked municipal projects with before/after impact.</p>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('admin', 'projects');
                }}
                className="w-full py-1.5 px-2.5 rounded-md text-xs font-semibold bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/40 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Project Kanban</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>

          {/* Interactive Deep-Dive Inspector Panel */}
          <div className="mt-8 p-6 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl transition-all">
            {selectedStep === 1 && (
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold">STAGE 01</span>
                    <h4 className="text-lg font-bold text-white">Multilingual Citizen Omnichannel Ingestion</h4>
                  </div>
                  <p className="text-sm text-slate-300">
                    Citizens can speak in Hindi, regional dialects, or English via the Web Speech API. They can also submit plain text or upload photographic evidence with automatic geotagging.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 pt-1">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Continuous voice recognition with interim transcripts</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Reverse geocoding & coordinate validation across districts</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Instant verification tracking ID generation (e.g. JNS-497236)</li>
                  </ul>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={() => onNavigate('citizen')}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    Open Citizen Reporting Portal
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {onTriggerSimulation && (
                    <button
                      onClick={onTriggerSimulation}
                      disabled={isSimulating}
                      className="px-4 py-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Zap className={`w-4 h-4 text-amber-400 ${isSimulating ? 'animate-spin' : ''}`} />
                      Simulate 5 Distress Reports
                    </button>
                  )}
                </div>
              </div>
            )}

            {selectedStep === 2 && (
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-xs font-mono font-bold">STAGE 02</span>
                    <h4 className="text-lg font-bold text-white">AI Categorization, Severity Scoring & Vision Inspection</h4>
                  </div>
                  <p className="text-sm text-slate-300">
                    Gemini AI engine (with deterministic multilingual NLP fallback) extracts standardized taxonomy, severity ratings (1–10), and identifies critical service disruptions (Healthcare, Schools, Transport).
                  </p>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                    <div><span className="text-blue-400">Input:</span> "हमारे गांव की सड़क बारिश में पूरी तरह खराब हो जाती है और एम्बुलेंस नहीं पहुंच पाती।"</div>
                    <div><span className="text-emerald-400">Extracted:</span> Road Infrastructure | Severity: 9/10 | Affected: ['Healthcare', 'Transportation']</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => onNavigate('admin', 'reports')}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-950/50 cursor-pointer"
                  >
                    <Cpu className="w-4 h-4" />
                    Inspect All Classified Reports
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {selectedStep === 3 && (
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-xs font-mono font-bold">STAGE 03</span>
                    <h4 className="text-lg font-bold text-white">Spatial DBSCAN Clustering & Semantic Deduplication</h4>
                  </div>
                  <p className="text-sm text-slate-300">
                    Aggregates thousands of isolated reports into coherent geographic hotspots using Haversine distance DBSCAN clustering + TF-IDF semantic vector similarity.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 pt-1">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> Prevents duplicate complaints from obscuring systemic failures</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> Enriched with Census demographic density data (e.g. 8,420 population)</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> Pinpoints precise geospatial coordinates and affected radii</li>
                  </ul>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => onNavigate('admin', 'map')}
                    className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-950/50 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    Open Interactive GIS Hotspot Map
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {selectedStep === 4 && (
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 text-xs font-mono font-bold">STAGE 04</span>
                    <h4 className="text-lg font-bold text-white">Transparent 6-Factor Priority Score Engine</h4>
                  </div>
                  <p className="text-sm text-slate-300">
                    Replaces political arbitrariness with an auditable mathematical prioritization formula (0–100) with complete explainability checklists.
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-purple-300">
                    Priority = 0.30×Demand + 0.20×Population + 0.20×Gap + 0.15×Severity + 0.10×CriticalService + 0.05×Urgency
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => onNavigate('admin', 'settings')}
                    className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-purple-950/50 cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Adjust Weight Sliders & Algorithm
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {selectedStep === 5 && (
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-xs font-mono font-bold">STAGE 05</span>
                    <h4 className="text-lg font-bold text-white">Municipal Action Tracking & Closed-Loop Impact Audits</h4>
                  </div>
                  <p className="text-sm text-slate-300">
                    Converts prioritized hotspots into tracked public works projects. Tracks lifecycle stages from Proposed to Completed with verified before/after impact measurement.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 pt-1">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-rose-400" /> Kanban pipeline: Proposed → Approved → In Progress → Completed</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-rose-400" /> Before/After audit metrics: -88% drop in citizen complaints</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-rose-400" /> Database-grounded AI Assistant providing citations</li>
                  </ul>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => onNavigate('admin', 'projects')}
                    className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Open Project Kanban & Impact
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Paradigm Shift Comparison */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Why JanSetu AI is Fundamentally Different
          </h2>
          <p className="text-slate-400 text-sm">
            Moving beyond isolated complaint ticketing to true Development Intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional System */}
          <div className="p-6 rounded-xl bg-slate-800/40 border border-red-900/40">
            <div className="text-red-400 font-bold text-sm tracking-wide uppercase mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Traditional Grievance Systems
            </div>
            <div className="p-4 rounded-lg bg-red-950/20 border border-red-800/30 text-slate-300 font-mono text-xs mb-4">
              "Complaint #9042 received. Forwarded to local desk."
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                Treats 500 reports in the same road corridor as 500 isolated, competing tickets.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                No geographic clustering or demographic population impact modeling.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                Zero correlation with existing public health or transport infrastructure gaps.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                No before/after measurement of whether public investment solved the core bottleneck.
              </li>
            </ul>
          </div>

          {/* JanSetu AI System */}
          <div className="p-6 rounded-xl bg-slate-800/40 border border-emerald-700/40 shadow-lg shadow-emerald-950/20 flex flex-col justify-between">
            <div>
              <div className="text-emerald-400 font-bold text-sm tracking-wide uppercase mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> JanSetu Development Intelligence
              </div>
              <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-700/40 text-emerald-200 font-mono text-xs mb-4">
                "647 related reports indicate a high-priority rural road connectivity gap affecting ~8,420 people and blocking ambulance access."
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  Aggregates fragmented voice/text into localized issue hotspots (e.g. RD-2048).
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  DBSCAN spatial clustering reveals chronic community infrastructure bottlenecks.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  Transparent 6-factor priority engine with verifiable "Why Prioritized" breakdown.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  End-to-end action tracking with verified Before/After transit & health metrics.
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-900/40">
              <button
                onClick={() => onNavigate('admin', 'hotspots')}
                className="w-full py-2 px-4 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/50 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Clustered Hotspot RD-2048</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={() => onNavigate('admin')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-900/20 transition-all"
          >
            Launch District Intelligence Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

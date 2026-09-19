import React, { useState, useEffect } from 'react';
import { translations, Language } from '../i18n/translations';
import { api } from '../services/api';
import { 
  CitizenReport, 
  IssueCluster, 
  Project, 
  ImpactMeasurement, 
  OverviewAnalytics, 
  Recommendation,
  DistrictDistribution 
} from '../types';
import { 
  BarChart3, 
  Map as MapIcon, 
  Layers, 
  FileText, 
  TrendingDown, 
  Sparkles, 
  Kanban, 
  CheckCircle2, 
  Sliders, 
  Search, 
  RefreshCw, 
  Plus, 
  Eye, 
  ChevronRight, 
  ShieldCheck,
  AlertTriangle,
  Activity,
  Download,
  Printer,
  Smartphone,
  FileCheck,
  Compass,
  Users,
  Building2,
  Filter,
  Zap,
  Bot,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

export const DISTRICT_COORDINATES: Record<string, { center: [number, number]; zoom: number }> = {
  All: { center: [25.80, 83.20], zoom: 7 },
  Varanasi: { center: [25.3850, 83.0210], zoom: 11 },
  Gorakhpur: { center: [26.7606, 83.3732], zoom: 11 },
  Prayagraj: { center: [25.4358, 81.8463], zoom: 11 },
  Patna: { center: [25.5941, 85.1376], zoom: 11 },
  Ranchi: { center: [23.3441, 85.3096], zoom: 11 }
};

interface MapControllerProps {
  center: [number, number];
  zoom: number;
  activeTab: string;
  selectedDistrict: string;
}

const MapController: React.FC<MapControllerProps> = ({ center, zoom, activeTab, selectedDistrict }) => {
  const map = useMap();

  useEffect(() => {
    if (activeTab === 'map') {
      const timer = setTimeout(() => {
        map.invalidateSize();
        map.flyTo(center, zoom, { duration: 1.0 });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [center, zoom, activeTab, selectedDistrict, map]);

  return null;
};

interface AdminDashboardProps {
  lang: Language;
  onOpenAssistant: () => void;
  onTriggerSimulation: () => void;
  isSimulating: boolean;
  initialTab?: TabType;
}

type TabType = 'overview' | 'map' | 'hotspots' | 'reports' | 'gaps' | 'recommendations' | 'projects' | 'impact' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang,
  onOpenAssistant,
  onTriggerSimulation,
  isSimulating,
  initialTab = 'overview'
}) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [analytics, setAnalytics] = useState<OverviewAnalytics | null>(null);
  const [hotspots, setHotspots] = useState<IssueCluster[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [impactRecords, setImpactRecords] = useState<ImpactMeasurement[]>([]);
  const [gaps, setGaps] = useState<any[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({
    citizen_demand: 0.30,
    population_impact: 0.20,
    infrastructure_gap: 0.20,
    severity: 0.15,
    critical_service: 0.10,
    urgency: 0.05
  });

  const [loading, setLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<IssueCluster | null>(null);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [savingWeights, setSavingWeights] = useState(false);
  const [broadcastNotification, setBroadcastNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    count: number;
  } | null>(null);
  const [dprModalCluster, setDprModalCluster] = useState<IssueCluster | null>(null);
  const [activeOverviewModal, setActiveOverviewModal] = useState<'districts' | 'dbscan' | 'critical' | 'resolved' | null>(null);
  const [overviewToast, setOverviewToast] = useState<{ title: string; message: string } | null>(null);
  const [mapStyle, setMapStyle] = useState<'google' | 'satellite' | 'voyager' | 'osm'>('google');

  const showToast = (title: string, message: string) => {
    setOverviewToast({ title, message });
    setTimeout(() => {
      setOverviewToast(null);
    }, 4500);
  };

  const defaultDistricts: DistrictDistribution[] = [
    {
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      reports: 2120,
      hotspots: 2,
      critical_count: 1,
      population: 35000,
      top_category: 'Road Infrastructure',
      cluster_codes: ['RD-2048', 'RD-9010']
    },
    {
      district: 'Gorakhpur',
      state: 'Uttar Pradesh',
      reports: 1120,
      hotspots: 1,
      critical_count: 1,
      population: 22000,
      top_category: 'Drinking Water',
      cluster_codes: ['WT-1102']
    },
    {
      district: 'Prayagraj',
      state: 'Uttar Pradesh',
      reports: 850,
      hotspots: 1,
      critical_count: 1,
      population: 18500,
      top_category: 'Healthcare',
      cluster_codes: ['HC-3015']
    },
    {
      district: 'Patna',
      state: 'Bihar',
      reports: 750,
      hotspots: 1,
      critical_count: 0,
      population: 15000,
      top_category: 'Sanitation & Drainage',
      cluster_codes: ['SN-4050']
    },
    {
      district: 'Ranchi',
      state: 'Jharkhand',
      reports: 487,
      hotspots: 1,
      critical_count: 0,
      population: 12000,
      top_category: 'Electricity',
      cluster_codes: ['EL-5021']
    }
  ];

  const districtList: DistrictDistribution[] = analytics?.district_distribution && analytics.district_distribution.length > 0 
    ? analytics.district_distribution 
    : defaultDistricts;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        analyticsData,
        hotspotsData,
        reportsData,
        recsData,
        projectsData,
        impactData,
        gapsData,
        weightsData
      ] = await Promise.all([
        api.getOverviewAnalytics(),
        api.getHotspots(),
        api.getReports({ limit: 50 }),
        api.getRecommendations(),
        api.getProjects(),
        api.getImpactMeasurements(),
        api.getDevelopmentGaps(),
        api.getPriorityWeights()
      ]);

      setAnalytics(analyticsData);
      setHotspots(hotspotsData);
      setReports(reportsData);
      setRecommendations(recsData);
      setProjects(projectsData);
      setImpactRecords(impactData);
      setGaps(gapsData);
      if (weightsData?.weights) setWeights(weightsData.weights);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredHotspots = hotspots.filter((h) => {
    if (selectedDistrict !== 'All' && h.district !== selectedDistrict) return false;
    if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && h.priority_level !== selectedPriority) return false;
    return true;
  });

  const filteredReports = reports.filter((r) => {
    if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
    if (selectedDistrict !== 'All' && !r.location_name?.includes(selectedDistrict)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.original_text.toLowerCase().includes(q) ||
        r.translated_summary.toLowerCase().includes(q) ||
        r.tracking_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateProject = async (cluster: IssueCluster) => {
    try {
      const newProj = await api.createProject({
        cluster_id: cluster.id,
        title: `Remediation: ${cluster.title}`,
        description: `Targeted infrastructure intervention for Hotspot ${cluster.cluster_code} affecting ~${cluster.estimated_population.toLocaleString()} residents.`,
        district: cluster.district,
        target_area: cluster.primary_location,
        category: cluster.category,
        estimated_budget: cluster.estimated_population * 450,
        estimated_beneficiaries: cluster.estimated_population
      });

      alert(`Project ${newProj.project_code} created successfully!`);
      fetchData();
      setActiveTab('projects');
    } catch (err) {
      alert('Failed to create project.');
    }
  };

  const handleAdvanceProject = async (projectId: string, currentStatus: string) => {
    const pipeline = ['Identified', 'Verified', 'Proposed', 'Approved', 'In Progress', 'Completed'];
    const currIdx = pipeline.indexOf(currentStatus);
    if (currIdx < pipeline.length - 1) {
      const nextStatus = pipeline[currIdx + 1];
      const updatedProj = await api.updateProjectStatus(projectId, nextStatus);
      fetchData();

      const citizenCount = updatedProj.estimated_beneficiaries || 4500;
      setBroadcastNotification({
        show: true,
        title: `Citizen Broadcast Dispatched • Project ${updatedProj.project_code}`,
        message: `Status updated to "${nextStatus}". An automated SMS/WhatsApp alert with tracking link has been broadcast to ~${citizenCount.toLocaleString()} affected residents in ${updatedProj.target_area}.`,
        count: citizenCount
      });
      setTimeout(() => {
        setBroadcastNotification(null);
      }, 7000);
    }
  };

  const handleSaveWeights = async () => {
    setSavingWeights(true);
    try {
      await api.updatePriorityWeights(weights);
      alert('Prioritization weights updated! All active hotspot priority scores recalculated.');
      fetchData();
    } catch (err) {
      alert('Failed to update weights.');
    } finally {
      setSavingWeights(false);
    }
  };

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950/80 border border-blue-700/50 text-blue-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              District Administrative Portal
            </div>
            <span className="text-xs text-slate-400 hidden md:inline">
              Synchronized with Census 2021 & PMGSY Infrastructure Registry
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="All">{t.allDistricts}</option>
              <option value="Varanasi">Varanasi</option>
              <option value="Gorakhpur">Gorakhpur</option>
              <option value="Prayagraj">Prayagraj</option>
              <option value="Patna">Patna</option>
              <option value="Ranchi">Ranchi</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="All">{t.allCategories}</option>
              <option value="Road Infrastructure">Road Infrastructure</option>
              <option value="Drinking Water">Drinking Water</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Sanitation & Drainage">Sanitation & Drainage</option>
              <option value="Electricity">Electricity</option>
            </select>

            <a
              href={api.getHotspotsCsvUrl()}
              download="jansetu_hotspots_export.csv"
              title="Export Clustered Hotspots to CSV"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{t.exportCsv}</span>
            </a>

            <button
              onClick={onOpenAssistant}
              title="Open AI Intelligence Assistant"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'JanSetu AI' : 'AI Assistant'}</span>
            </button>

            <button
              onClick={fetchData}
              title="Refresh Data"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Citizen Broadcast Notification Banner */}
      {broadcastNotification && (
        <div className="bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border-b border-blue-500/40 px-4 py-2.5 text-white shadow-xl flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-300 shrink-0">
              <Smartphone className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-200 flex items-center gap-2">
                <span>{broadcastNotification.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-mono uppercase">DISPATCHED</span>
              </div>
              <p className="text-xs text-slate-300">{broadcastNotification.message}</p>
            </div>
          </div>
          <button 
            onClick={() => setBroadcastNotification(null)}
            className="p-1 text-slate-400 hover:text-white rounded text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {[
            { id: 'overview', label: t.tabs.overview, icon: BarChart3 },
            { id: 'map', label: t.tabs.map, icon: MapIcon },
            { id: 'hotspots', label: t.tabs.hotspots, icon: Layers },
            { id: 'reports', label: t.tabs.reports, icon: FileText },
            { id: 'gaps', label: t.tabs.gaps, icon: TrendingDown },
            { id: 'recommendations', label: t.tabs.recommendations, icon: Sparkles },
            { id: 'projects', label: t.tabs.projects, icon: Kanban },
            { id: 'impact', label: t.tabs.impact, icon: CheckCircle2 },
            { id: 'settings', label: t.tabs.settings, icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CARD 1: Total Citizen Reports (5 Districts) */}
              <div 
                onClick={() => setActiveOverviewModal('districts')}
                className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-emerald-500/80 hover:bg-slate-800 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-950/30 group relative select-none"
                title="Click to view 5 Districts Spatial Breakdown & Report Distribution"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase mb-2">
                  <span className="group-hover:text-emerald-300 transition-colors font-semibold">{t.kpiTotalReports}</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white flex items-baseline gap-2">
                  {analytics?.total_reports.toLocaleString() || '5,327'}
                  <span className="text-xs font-normal text-emerald-400/80 font-mono">live</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center justify-between">
                  <span>Clustered across 5 districts</span>
                  <span className="text-[10px] text-emerald-300/80 group-hover:text-emerald-200 flex items-center gap-0.5 opacity-90 group-hover:translate-x-0.5 transition-all font-semibold">
                    Breakdown <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* CARD 2: Active Hotspots (DBSCAN Spatial) */}
              <div 
                onClick={() => setActiveOverviewModal('dbscan')}
                className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-blue-500/80 hover:bg-slate-800 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-950/30 group relative select-none"
                title="Click to inspect DBSCAN Spatial Clustering Hyperparameters & Active Hotspots"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase mb-2">
                  <span className="group-hover:text-blue-300 transition-colors font-semibold">{t.kpiActiveHotspots}</span>
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white flex items-baseline gap-2">
                  {analytics?.active_hotspots || '6'}
                  <span className="text-xs font-normal text-blue-400/80 font-mono">clusters</span>
                </div>
                <div className="text-[11px] text-blue-400 font-medium mt-1 flex items-center justify-between">
                  <span>DBSCAN Spatial Hotspots</span>
                  <span className="text-[10px] text-blue-300/80 group-hover:text-blue-200 flex items-center gap-0.5 opacity-90 group-hover:translate-x-0.5 transition-all font-semibold">
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* CARD 3: Critical Priorities (Score >= 85.0) */}
              <div 
                onClick={() => setActiveOverviewModal('critical')}
                className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-rose-500/80 hover:bg-slate-800 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-950/30 group relative select-none"
                title="Click to view Priority Score ≥ 85.0 Critical Infrastructure Deficits"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase mb-2">
                  <span className="group-hover:text-rose-300 transition-colors font-semibold">{t.kpiCriticalIssues}</span>
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 group-hover:scale-110 transition-all">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-rose-400 flex items-baseline gap-2">
                  {analytics?.critical_issues || '3'}
                  <span className="text-xs font-normal text-rose-300/80 font-mono">urgent</span>
                </div>
                <div className="text-[11px] text-rose-300 font-medium mt-1 flex items-center justify-between">
                  <span>Priority Score &ge; 85.0</span>
                  <span className="text-[10px] text-rose-200/80 group-hover:text-rose-100 flex items-center gap-0.5 opacity-90 group-hover:translate-x-0.5 transition-all font-semibold">
                    Review <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* CARD 4: Resolved Projects (Measured Before/After) */}
              <div 
                onClick={() => setActiveOverviewModal('resolved')}
                className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-purple-500/80 hover:bg-slate-800 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-950/30 group relative select-none"
                title="Click to view Closed-Loop Impact Evaluation & Before/After Validation"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase mb-2">
                  <span className="group-hover:text-purple-300 transition-colors font-semibold">{t.kpiResolved}</span>
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-purple-400 flex items-baseline gap-2">
                  {analytics?.resolved_count || '5'}
                  <span className="text-xs font-normal text-purple-300/80 font-mono">verified</span>
                </div>
                <div className="text-[11px] text-purple-300 font-medium mt-1 flex items-center justify-between">
                  <span>Measured Before/After</span>
                  <span className="text-[10px] text-purple-200/80 group-hover:text-purple-100 flex items-center gap-0.5 opacity-90 group-hover:translate-x-0.5 transition-all font-semibold">
                    Validate <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category Bar Chart with Click-to-Filter */}
              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/60 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    Citizen Demands by Infrastructure Category
                  </h3>
                  <span className="text-[11px] text-blue-400/90 font-medium bg-blue-950/70 border border-blue-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                    💡 Click bar to drill into category reports
                  </span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.category_distribution || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: 12 }} />
                      <Bar 
                        dataKey="reports" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                        onClick={(entry: any) => {
                          if (entry && entry.name) {
                            setSelectedCategory(entry.name);
                            setActiveTab('reports');
                            showToast(`Filtered Category: ${entry.name}`, `Viewing citizen submissions under ${entry.name}.`);
                          }
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Priority Pie Chart with Click-to-Filter */}
              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Priority Distribution
                  </h3>
                  <span className="text-[11px] text-emerald-400/90 font-medium bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                    💡 Click slice to filter
                  </span>
                </div>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.priority_distribution || []}
                        dataKey="count"
                        nameKey="level"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        className="cursor-pointer"
                        onClick={(entry: any) => {
                          const level = entry?.level || entry?.name;
                          if (level) {
                            setSelectedPriority(level);
                            setActiveTab('hotspots');
                            showToast(`Filtered by Priority: ${level}`, `Showing all hotspot clusters marked as ${level} priority.`);
                          }
                        }}
                        label={(entry: any) => `${entry.level || entry.name || ''}: ${entry.count || entry.value || ''}`}
                      >
                        {(analytics?.priority_distribution || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="cursor-pointer hover:opacity-85 transition-opacity" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* TAB 2: MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base text-white">Geographic Development Hotspots</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                    {filteredHotspots.length} Clusters Visible
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Leaflet GIS spatial clustering with dynamic auto-panning and multi-criteria priority indexing
                </p>
              </div>

              {/* Map Layer & Reset Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
                  <button
                    onClick={() => setMapStyle('google')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                      mapStyle === 'google' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Google Maps Roadmap (Highest Accuracy)"
                  >
                    🗺️ Google Maps
                  </button>
                  <button
                    onClick={() => setMapStyle('satellite')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                      mapStyle === 'satellite' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Google Satellite Hybrid with Labels"
                  >
                    🛰️ Satellite
                  </button>
                  <button
                    onClick={() => setMapStyle('voyager')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                      mapStyle === 'voyager' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    High-Contrast
                  </button>
                  <button
                    onClick={() => setMapStyle('osm')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                      mapStyle === 'osm' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Street Map
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedDistrict('All');
                    setSelectedCategory('All');
                    setSelectedPriority('All');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                  title="Reset filters and view all regions"
                >
                  Reset View
                </button>
              </div>
            </div>

            {/* Quick District Navigation Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] text-slate-400 font-semibold shrink-0 mr-1">Jump to Region:</span>
              {[
                { name: 'All', label: '🌐 All Regions' },
                { name: 'Varanasi', label: '📍 Varanasi (UP)' },
                { name: 'Gorakhpur', label: '📍 Gorakhpur (UP)' },
                { name: 'Prayagraj', label: '📍 Prayagraj (UP)' },
                { name: 'Patna', label: '📍 Patna (Bihar)' },
                { name: 'Ranchi', label: '📍 Ranchi (Jharkhand)' }
              ].map((pill) => {
                const active = selectedDistrict === pill.name;
                return (
                  <button
                    key={pill.name}
                    onClick={() => setSelectedDistrict(pill.name)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      active 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400' 
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700/60'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Map Container with Overlays */}
            <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl h-[580px] relative z-0">
              <MapContainer 
                center={DISTRICT_COORDINATES[selectedDistrict]?.center || [25.80, 83.20]} 
                zoom={DISTRICT_COORDINATES[selectedDistrict]?.zoom || 7} 
                maxZoom={20}
                style={{ height: '100%', width: '100%' }}
              >
                <MapController 
                  center={DISTRICT_COORDINATES[selectedDistrict]?.center || [25.80, 83.20]} 
                  zoom={DISTRICT_COORDINATES[selectedDistrict]?.zoom || 7} 
                  activeTab={activeTab} 
                  selectedDistrict={selectedDistrict} 
                />
                {mapStyle === 'google' && (
                  <TileLayer
                    attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    maxZoom={20}
                  />
                )}
                {mapStyle === 'satellite' && (
                  <TileLayer
                    attribution='&copy; <a href="https://maps.google.com">Google Maps Satellite</a>'
                    url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                    maxZoom={20}
                  />
                )}
                {mapStyle === 'voyager' && (
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    maxZoom={19}
                  />
                )}
                {mapStyle === 'osm' && (
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                  />
                )}
                {filteredHotspots.map((h) => {
                  const isCritical = h.priority_level === 'CRITICAL';
                  const isHigh = h.priority_level === 'HIGH';
                  const color = isCritical ? '#ef4444' : isHigh ? '#f97316' : '#eab308';
                  return (
                    <CircleMarker
                      key={h.id}
                      center={[h.center_lat, h.center_lng]}
                      radius={Math.max(14, Math.min(36, h.report_count / 16))}
                      pathOptions={{ 
                        color, 
                        fillColor: color, 
                        fillOpacity: isCritical ? 0.75 : 0.6, 
                        weight: isCritical ? 3 : 2 
                      }}
                    >
                      <Popup>
                        <div className="p-1 text-slate-900 max-w-xs text-xs font-sans">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              {h.cluster_code}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isCritical ? 'bg-rose-100 text-rose-800' : isHigh ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {h.priority_level} ({h.priority_score.toFixed(1)})
                            </span>
                          </div>
                          
                          <div className="font-bold text-sm text-slate-900 mb-1">{h.title}</div>
                          <p className="text-slate-600 text-[11px] mb-2">📍 {h.primary_location}, {h.district}</p>

                          <div className="bg-slate-100 p-2 rounded-lg mb-2 space-y-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Citizen Reports:</span>
                              <strong className="text-slate-900">{h.report_count}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Beneficiary Reach:</span>
                              <strong className="text-slate-900">~{h.estimated_population.toLocaleString()}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Physical Severity:</span>
                              <strong className="text-slate-900">{h.severity_score.toFixed(0)} / 100</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1">
                            <a
                              href={`https://www.google.com/maps?q=${h.center_lat},${h.center_lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
                              title="Inspect exact hotspot coordinates on Google Maps"
                            >
                              <ExternalLink className="w-3 h-3 text-emerald-700" /> Google
                            </a>
                            <button
                              onClick={() => setDprModalCluster(h)}
                              className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <FileCheck className="w-3.5 h-3.5" /> DPR
                            </button>
                            <button
                              onClick={() => handleCreateProject(h)}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Sanction
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>

              {/* Floating Map Legend Overlay */}
              <div className="absolute bottom-4 right-4 z-20 bg-slate-950/90 border border-slate-700/80 backdrop-blur-md p-3 rounded-xl shadow-2xl text-[11px] text-slate-300 space-y-1.5 pointer-events-auto">
                <div className="font-bold text-white uppercase text-[10px] tracking-wider mb-1">
                  Hotspot Priority Legend
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                  <span>Critical Priority (Score ≥ 85.0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>High Priority (Score 70 – 84.9)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span>Moderate Priority (Score 50 – 69.9)</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                  Radius represents citizen report density
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HOTSPOTS */}
        {activeTab === 'hotspots' && (
          <div className="space-y-4">
            <h2 className="font-bold text-base text-white">Development Hotspot Intelligence & Ranking</h2>
            <div className="grid grid-cols-1 gap-4">
              {filteredHotspots.map((h) => (
                <div key={h.id} className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono font-bold text-xs border border-blue-800">
                        {h.cluster_code}
                      </span>
                      <h3 className="font-bold text-sm text-white">{h.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        h.priority_level === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {h.priority_level}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                      <span>📍 {h.primary_location}, {h.district}</span>
                      <span>📋 {h.report_count} Reports</span>
                      <span>👥 ~{h.estimated_population.toLocaleString()} Beneficiaries</span>
                      <span>🏥 Impact: {h.affected_services.join(', ')}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {h.why_prioritized?.map((reason, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[11px]">
                          ✓ {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Priority Score</div>
                      <div className="text-2xl font-black text-white">{h.priority_score.toFixed(1)}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDistrict(h.district);
                        setActiveTab('map');
                      }}
                      className="px-3 py-2 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="View hotspot location on interactive GIS map"
                    >
                      <MapIcon className="w-3.5 h-3.5" /> Map
                    </button>
                    <button
                      onClick={() => setDprModalCluster(h)}
                      className="px-3 py-2 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5" /> DPR Dossier
                    </button>
                    <button
                      onClick={() => handleCreateProject(h)}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CITIZEN REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-bold text-base text-white">Constituent Citizen Submissions</h2>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-800/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Original Submission</th>
                    <th className="p-3">Normalized Summary</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredReports.slice(0, 20).map((r) => (
                    <tr 
                      key={r.id} 
                      onClick={() => setSelectedReport(r)}
                      className="hover:bg-slate-800/80 transition cursor-pointer group"
                      title="Click to view full citizen report dossier & AI observations"
                    >
                      <td className="p-3 font-mono text-emerald-400 font-bold whitespace-nowrap flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                        {r.tracking_id}
                      </td>
                      <td className="p-3 max-w-xs truncate" title={r.original_text}>{r.original_text}</td>
                      <td className="p-3 max-w-xs truncate text-slate-400" title={r.translated_summary}>{r.translated_summary}</td>
                      <td className="p-3 whitespace-nowrap"><span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-medium">{r.category}</span></td>
                      <td className="p-3 whitespace-nowrap font-bold text-rose-400">{r.severity}/10</td>
                      <td className="p-3 whitespace-nowrap text-slate-400">{r.location_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: GAPS */}
        {activeTab === 'gaps' && (
          <div className="space-y-4">
            <h2 className="font-bold text-base text-white">Infrastructure Gap Indices (100 - Existing Infrastructure Index)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gaps.map((g, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-700 font-bold">{g.district}</span>
                    <span className="font-bold text-rose-400">Gap Score: {g.gap_score.toFixed(1)}/100</span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{g.category}</h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Existing Infrastructure Index:</span>
                      <strong className="text-white">{g.existing_infra_index.toFixed(1)}/100</strong>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${g.existing_infra_index}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <h2 className="font-bold text-base text-white">AI-Generated Public Infrastructure Interventions</h2>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="font-mono text-xs text-blue-300 font-bold">Intervention Ref: {rec.cluster_id?.substring(0, 8)}</span>
                    <span className="text-xs text-emerald-400 font-semibold">Confidence: {Math.round(rec.confidence_score * 100)}%</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <strong className="text-slate-400 block mb-1">Problem:</strong>
                      <p className="text-slate-200">{rec.problem_summary}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <strong className="text-slate-400 block mb-1">Supporting Evidence:</strong>
                      <p className="text-slate-200">{rec.evidence_summary}</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-700/40 text-xs">
                    <strong className="text-emerald-400 block mb-1">Proposed Intervention:</strong>
                    <p className="text-emerald-100 font-medium text-sm">{rec.recommended_intervention}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] text-slate-400">Impact: {rec.expected_service_impact}</span>
                    <button
                      onClick={() => {
                        const m = hotspots.find(h => h.id === rec.cluster_id);
                        if (m) handleCreateProject(m);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow"
                    >
                      Create Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* TAB 7: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <h2 className="font-bold text-base text-white">Civic Action Pipeline & Status Tracking</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto">
              {['Identified', 'Verified', 'Proposed', 'Approved', 'In Progress', 'Completed'].map((stage) => {
                const stageProjects = projects.filter((p) => p.status === stage);
                return (
                  <div key={stage} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col min-w-[190px]">
                    <div className="flex justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
                      <span>{stage}</span>
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
                        {stageProjects.length}
                      </span>
                    </div>
                    <div className="space-y-2 flex-1">
                      {stageProjects.map((p) => (
                        <div key={p.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 space-y-1.5 text-xs">
                          <div className="flex justify-between font-mono text-[10px] text-blue-400 font-bold">
                            <span>{p.project_code}</span>
                            <span>{p.district}</span>
                          </div>
                          <h4 className="font-bold text-white leading-snug">{p.title}</h4>
                          <div className="text-[10px] text-emerald-400 font-medium">
                            ₹{(p.estimated_budget / 100000).toFixed(1)}L • ~{p.estimated_beneficiaries.toLocaleString()} People
                          </div>
                          {stage !== 'Completed' && (
                            <button
                              onClick={() => handleAdvanceProject(p.id, p.status)}
                              className="w-full mt-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 border border-slate-700"
                            >
                              Next Stage &rarr;
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 8: IMPACT */}
        {activeTab === 'impact' && (
          <div className="space-y-4">
            <h2 className="font-bold text-base text-white">Before vs After Civic Impact Audits</h2>
            <div className="space-y-4">
              {impactRecords.map((imp) => (
                <div key={imp.id} className="p-6 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="text-xs font-mono font-bold text-purple-300">Project: {imp.project_id.substring(0, 16)}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-bold">
                      Impact Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Complaints Volume</span>
                      <div className="flex justify-center items-center gap-2">
                        <span className="text-xl font-bold text-rose-400">{imp.pre_report_count}</span>
                        <span>&rarr;</span>
                        <span className="text-xl font-bold text-emerald-400">{imp.post_report_count}</span>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold block mt-1">
                        {Math.round(((imp.pre_report_count - imp.post_report_count) / imp.pre_report_count) * 100)}% Drop
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Infrastructure Index</span>
                      <div className="flex justify-center items-center gap-2">
                        <span className="text-xl font-bold text-slate-300">{imp.pre_infra_index.toFixed(0)}</span>
                        <span>&rarr;</span>
                        <span className="text-xl font-bold text-emerald-400">{imp.post_infra_index.toFixed(0)}</span>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold block mt-1">
                        +{(imp.post_infra_index - imp.pre_infra_index).toFixed(1)} Points
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Satisfaction</span>
                      <div className="text-2xl font-black text-white">{imp.citizen_satisfaction_score.toFixed(1)}%</div>
                      <span className="text-[10px] text-slate-400">Post-completion audit</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <strong>Transit Impact:</strong> {imp.emergency_access_change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-bold text-base text-white">Prioritization Scoring Engine Weights</h2>
            <div className="p-6 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-4">
              {[
                { key: 'citizen_demand', label: 'Citizen Demand (Report Frequency)' },
                { key: 'population_impact', label: 'Population Impact (Beneficiary Demographics)' },
                { key: 'infrastructure_gap', label: 'Infrastructure Gap Score' },
                { key: 'severity', label: 'Physical Severity Index' },
                { key: 'critical_service', label: 'Critical Service Impact (Healthcare/Water)' },
                { key: 'urgency', label: 'Immediate Hazards & Urgency' }
              ].map((item) => (
                <div key={item.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>{item.label}</span>
                    <span className="font-mono text-emerald-400">{Math.round((weights[item.key] || 0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights[item.key] || 0}
                    onChange={(e) => setWeights({ ...weights, [item.key]: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              ))}

              <div className="pt-4 border-t border-slate-700 flex justify-end">
                <button
                  onClick={handleSaveWeights}
                  disabled={savingWeights}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow disabled:opacity-50"
                >
                  {savingWeights ? 'Recalculating...' : 'Save & Recalculate Priorities'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Granular Hotspot Detail Modal */}
      {selectedHotspot && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-mono font-bold text-blue-400 text-sm">{selectedHotspot.cluster_code}: {selectedHotspot.title}</span>
              <button onClick={() => setSelectedHotspot(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Priority</span>
                <span className="text-xl font-bold text-rose-400">{selectedHotspot.priority_score.toFixed(1)}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Reports</span>
                <span className="text-xl font-bold text-white">{selectedHotspot.report_count}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Beneficiaries</span>
                <span className="text-xl font-bold text-white">~{selectedHotspot.estimated_population.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Severity</span>
                <span className="text-xl font-bold text-amber-400">{selectedHotspot.severity_score.toFixed(0)}</span>
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-400 block mb-1">Why Prioritized:</span>
              {selectedHotspot.why_prioritized?.map((r, i) => (
                <div key={i} className="p-2 rounded bg-slate-800/60 border border-slate-700/60 text-slate-200">
                  ✓ {r}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setSelectedHotspot(null)} className="px-3 py-1.5 rounded bg-slate-800 text-xs cursor-pointer">Close</button>
              <button
                onClick={() => { handleCreateProject(selectedHotspot); setSelectedHotspot(null); }}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official DPR (Detailed Project Report) Executive Modal */}
      {dprModalCluster && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Government Emblem & Header */}
            <div className="text-center border-b border-slate-700 pb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-700/50 text-[11px] font-semibold uppercase tracking-wider mb-2">
                <FileCheck className="w-3.5 h-3.5" />
                State Planning & Development Commission • Uttar Pradesh
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                DETAILED PROJECT REPORT (DPR)
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Sanction Dossier Ref: DPR/UP-DEV/2026/09/{dprModalCluster.cluster_code}
              </p>
            </div>

            {/* Core Identification Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Cluster Code</span>
                <span className="text-sm font-mono font-bold text-blue-400">{dprModalCluster.cluster_code}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">District & Sector</span>
                <span className="text-sm font-bold text-white">{dprModalCluster.district}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Priority Index</span>
                <span className="text-sm font-bold text-rose-400">{dprModalCluster.priority_score.toFixed(1)} / 100 ({dprModalCluster.priority_level})</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Beneficiary Reach</span>
                <span className="text-sm font-bold text-emerald-400">~{dprModalCluster.estimated_population.toLocaleString()} citizens</span>
              </div>
            </div>

            {/* Scope & Engineering Specifications */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">1. Problem Statement & Citizen Demand Grounding</h4>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <p className="font-bold text-white mb-1">{dprModalCluster.title}</p>
                <p>
                  Identified through automated geospatial clustering of <strong>{dprModalCluster.report_count} verified citizen submissions</strong>. Severe bottlenecks detected in essential service continuity: <strong>{dprModalCluster.affected_services.join(', ')}</strong>.
                </p>
              </div>

              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">2. Recommended Civil Engineering Scope of Work</h4>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Structural Remediation:</strong> Bituminous all-weather pavement with sub-base strengthening along {dprModalCluster.primary_location}.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Drainage & Culverts:</strong> Reinforced concrete cross-drainage culverts (2.5m span) to prevent seasonal flash flooding.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Targeted Scheme Alignment:</strong> Recommended funding under <strong>Pradhan Mantri Gram Sadak Yojana (PMGSY - Phase III)</strong> or Jal Jeevan Mission.</span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">3. Budget Estimation & Phasing</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Civil Construction</span>
                  <span className="font-bold text-white font-mono">₹{((dprModalCluster.estimated_population * 320) / 100000).toFixed(1)} Lakhs</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Utility Relocation</span>
                  <span className="font-bold text-white font-mono">₹{((dprModalCluster.estimated_population * 80) / 100000).toFixed(1)} Lakhs</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Total Sanctioned Estimate</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">₹{((dprModalCluster.estimated_population * 450) / 100000).toFixed(1)} Lakhs</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Grounded in live database records • Verified by JanSetu Priority Engine
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => {
                    handleCreateProject(dprModalCluster);
                    setDprModalCluster(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Sanction & Tender Project
                </button>
                <button
                  onClick={() => setDprModalCluster(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Overview Toast Notification */}
      {overviewToast && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900/95 border border-blue-500/60 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in max-w-sm">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white">{overviewToast.title}</div>
            <div className="text-[11px] text-slate-300 mt-0.5">{overviewToast.message}</div>
          </div>
          <button 
            onClick={() => setOverviewToast(null)}
            className="text-slate-400 hover:text-white text-xs p-1 ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* MODAL 1: 5 Districts Geospatial Breakdown */}
      {activeOverviewModal === 'districts' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-700 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-[11px] font-semibold uppercase tracking-wider mb-2">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  Regional Administrative Coverage Breakdown
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  5 Districts Clustered & Monitored
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cross-jurisdictional citizen submissions categorized across Uttar Pradesh, Bihar, and Jharkhand.
                </p>
              </div>
              <button
                onClick={() => setActiveOverviewModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Active Districts</span>
                <span className="text-xl font-extrabold text-white">5 Districts</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">UP • Bihar • Jharkhand</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Reports</span>
                <span className="text-xl font-extrabold text-emerald-400">{analytics?.total_reports.toLocaleString() || '5,327'}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">2,423 in Spatial Clusters</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Active Hotspots</span>
                <span className="text-xl font-extrabold text-blue-400">{analytics?.active_hotspots || 6} Clusters</span>
                <span className="text-[10px] text-blue-300 block mt-0.5">DBSCAN Spatial Radius 1.2km</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Impacted Citizens</span>
                <span className="text-xl font-extrabold text-purple-400">~102,500</span>
                <span className="text-[10px] text-purple-300 block mt-0.5">Census 2021 Density</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>District Jurisdiction Spatial Profiles</span>
                <span className="text-[11px] text-slate-500 font-normal">Click any action button to drill down</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {districtList.map((dist) => (
                  <div 
                    key={dist.district} 
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-base text-white">{dist.district}</h5>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {dist.state}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5 block">
                          Primary Issue: <strong className="text-emerald-300">{dist.top_category}</strong>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-emerald-400 font-mono">
                          {dist.reports.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">reports</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Hotspots</span>
                        <span className="text-xs font-bold text-blue-400 font-mono">{dist.hotspots} Active</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Critical</span>
                        <span className={`text-xs font-bold font-mono ${dist.critical_count > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {dist.critical_count} Alert
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Beneficiaries</span>
                        <span className="text-xs font-bold text-slate-200 font-mono">~{dist.population.toLocaleString()}</span>
                      </div>
                    </div>

                    {dist.cluster_codes && dist.cluster_codes.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="text-slate-500 text-[10px]">Clusters:</span>
                        {dist.cluster_codes.map((code) => (
                          <span key={code} className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900 font-mono text-[10px]">
                            {code}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedDistrict(dist.district);
                          setActiveTab('reports');
                          setActiveOverviewModal(null);
                          showToast(`District: ${dist.district}`, `Filtered reports for ${dist.district} (${dist.reports} reports).`);
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Reports
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDistrict(dist.district);
                          setActiveTab('map');
                          setActiveOverviewModal(null);
                          showToast(`Map: ${dist.district}`, `Centered map view on ${dist.district} hotspots.`);
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <MapIcon className="w-3.5 h-3.5" /> View on Map
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Multi-district aggregation powered by Spatial DBSCAN clustering & GIS census layering.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedDistrict('All');
                    setActiveTab('reports');
                    setActiveOverviewModal(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Explore All 5,327 Reports
                </button>
                <button
                  onClick={() => {
                    setActiveTab('map');
                    setActiveOverviewModal(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  View Geospatial Map
                </button>
                <button
                  onClick={() => setActiveOverviewModal(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DBSCAN Spatial Hotspot Clustering Engine */}
      {activeOverviewModal === 'dbscan' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-700 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-700/50 text-[11px] font-semibold uppercase tracking-wider mb-2">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Algorithmic Clustering Engine Specs
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  DBSCAN Geospatial Clustering & NLP Deduplication
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Density-Based Spatial Clustering of Applications with Noise (DBSCAN) automatically aggregates fragmented citizen complaints into coherent infrastructure hotspots.
                </p>
              </div>
              <button
                onClick={() => setActiveOverviewModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Spatial Radius (ε)</span>
                <span className="text-xl font-extrabold text-blue-400">1.2 km</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Haversine Great-Circle</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">MinPts (Density)</span>
                <span className="text-xl font-extrabold text-white">3 Reports</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Core Point Threshold</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Semantic Match</span>
                <span className="text-xl font-extrabold text-purple-400">TF-IDF ≥ 0.65</span>
                <span className="text-[10px] text-purple-300 block mt-0.5">Cosine Topic Similarity</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Active Clusters</span>
                <span className="text-xl font-extrabold text-emerald-400">{hotspots.length} Clusters</span>
                <span className="text-[10px] text-emerald-300 block mt-0.5">2,423 Clustered Reports</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                How the DBSCAN Pipeline Eliminates False Positives & Noise:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="font-bold text-blue-300 block mb-1">1. Spatial Density Check</span>
                  <span>Calculates geographic pairwise distance matrix across GPS report coordinates using Haversine spherical math.</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="font-bold text-emerald-300 block mb-1">2. Semantic Deduplication</span>
                  <span>Extracts n-grams and TF-IDF token vectors to confirm complaints describe the same underlying physical failure.</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="font-bold text-purple-300 block mb-1">3. Outlier Noise Suppression</span>
                  <span>Isolated or spam submissions (&lt; 3 reports within 1.2km) are segregated into an unverified holding queue.</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Active DBSCAN Clusters Detected ({hotspots.length})</span>
                <span className="text-[11px] text-slate-500 font-normal">Click DPR Dossier or Locate to inspect</span>
              </h4>

              <div className="space-y-2.5">
                {hotspots.map((h) => (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-500/40 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono font-bold text-xs border border-blue-800">
                          {h.cluster_code}
                        </span>
                        <span className="font-bold text-sm text-white">{h.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          h.priority_level === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {h.priority_level} ({h.priority_score.toFixed(1)})
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                        <span>📍 {h.primary_location}, {h.district}</span>
                        <span>📋 {h.report_count} clustered submissions</span>
                        <span>👥 ~{h.estimated_population.toLocaleString()} beneficiaries</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setDprModalCluster(h);
                          setActiveOverviewModal(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5" /> DPR Dossier
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDistrict(h.district);
                          setActiveTab('map');
                          setActiveOverviewModal(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                      >
                        <MapIcon className="w-3.5 h-3.5" /> Locate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Live DBSCAN recalculations execute dynamically on new report ingestion.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('map');
                    setActiveOverviewModal(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  View on Interactive Map
                </button>
                <button
                  onClick={() => {
                    setActiveTab('hotspots');
                    setActiveOverviewModal(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Manage Hotspots Registry
                </button>
                <button
                  onClick={() => setActiveOverviewModal(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Critical Priority Interventions (Score >= 85.0) */}
      {activeOverviewModal === 'critical' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-700 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-700/50 text-[11px] font-semibold uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Emergency Escalation Threshold
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Critical Priority Bottlenecks (Score &ge; 85.0)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Hotspots exceeding 85.0 trigger immediate escalation to the District Magistrate & Department Chief Engineer.
                </p>
              </div>
              <button
                onClick={() => setActiveOverviewModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Composite Priority Scoring Model</span>
                <span className="text-[11px] text-rose-400 font-mono">Score = Σ (Weight_i × Factor_i)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Demand</span>
                  <span className="font-mono font-bold text-white">30%</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Population</span>
                  <span className="font-mono font-bold text-white">20%</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Infra Gap</span>
                  <span className="font-mono font-bold text-white">20%</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Severity</span>
                  <span className="font-mono font-bold text-white">15%</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Services</span>
                  <span className="font-mono font-bold text-white">10%</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Urgency</span>
                  <span className="font-mono font-bold text-white">5%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                Active Critical Incidents ({hotspots.filter(h => h.priority_level === 'CRITICAL' || h.priority_score >= 85).length})
              </h4>

              <div className="space-y-3">
                {hotspots
                  .filter((h) => h.priority_level === 'CRITICAL' || h.priority_score >= 85)
                  .map((h) => (
                    <div
                      key={h.id}
                      className="p-4 rounded-xl bg-slate-950 border border-rose-900/60 hover:border-rose-600/80 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono font-bold text-xs border border-rose-800">
                            {h.cluster_code}
                          </span>
                          <h5 className="font-bold text-sm text-white">{h.title}</h5>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Composite Score:</span>
                          <span className="text-lg font-black text-rose-400 font-mono">
                            {h.priority_score.toFixed(1)} / 100
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                        <span>📍 {h.primary_location}, {h.district}</span>
                        <span>📋 {h.report_count} Reports</span>
                        <span>👥 ~{h.estimated_population.toLocaleString()} Residents</span>
                        <span>🏥 Impact: {h.affected_services.join(', ')}</span>
                      </div>

                      {h.why_prioritized && h.why_prioritized.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {h.why_prioritized.map((reason, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-rose-300 text-[11px]">
                              ⚠️ {reason}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setDprModalCluster(h);
                            setActiveOverviewModal(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5" /> Sanction DPR Dossier
                        </button>
                        <button
                          onClick={() => {
                            handleCreateProject(h);
                            setActiveOverviewModal(null);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Expedite Project
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Formula weights can be customized dynamically in Settings.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedPriority('CRITICAL');
                    setActiveTab('hotspots');
                    setActiveOverviewModal(null);
                    showToast('Filtered Hotspots', 'Displaying all Critical Priority clusters.');
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  View All Critical in Hotspots Tab
                </button>
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setActiveOverviewModal(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  Adjust Weights
                </button>
                <button
                  onClick={() => setActiveOverviewModal(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Resolved Projects & Closed-Loop Impact */}
      {activeOverviewModal === 'resolved' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-700 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-700/50 text-[11px] font-semibold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  Closed-Loop Impact Measurement
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Resolved Interventions & Measured Impact
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Empirical before-and-after audit verifying tangible improvements in infrastructure reliability, complaint reduction, and citizen trust.
                </p>
              </div>
              <button
                onClick={() => setActiveOverviewModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Completed Projects</span>
                <span className="text-xl font-extrabold text-purple-400">{analytics?.resolved_count || 5} Works</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Audited & Handed Over</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Complaint Reduction</span>
                <span className="text-xl font-extrabold text-emerald-400">-78.4%</span>
                <span className="text-[10px] text-emerald-300 block mt-0.5">Post-Remediation Drop</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Citizen Satisfaction</span>
                <span className="text-xl font-extrabold text-white">4.6 / 5.0</span>
                <span className="text-[10px] text-blue-300 block mt-0.5">91.8% Positive Sentiment</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Infra Reliability Gain</span>
                <span className="text-xl font-extrabold text-emerald-400">+42.6 pts</span>
                <span className="text-[10px] text-emerald-300 block mt-0.5">Access Index Lift</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Before / After Empirical Outcomes
              </h4>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-300">Citizen Grievance Volume in Remediated Corridors</span>
                    <span className="text-emerald-400">-78% Drop</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-slate-400 text-[10px]">Before:</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div className="bg-rose-500 h-full w-[85%]" />
                      </div>
                      <span className="font-mono text-slate-300 w-16 text-right">686 rpts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-slate-400 text-[10px]">After:</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[18%]" />
                      </div>
                      <span className="font-mono text-emerald-400 font-bold w-16 text-right">148 rpts</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-300">Infrastructure Gap Score (Lower is Better)</span>
                    <span className="text-emerald-400">Reduced from 82.4 to 19.5</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-slate-400 text-[10px]">Pre-Work:</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div className="bg-rose-500/80 h-full w-[82%]" />
                      </div>
                      <span className="font-mono text-rose-300 w-16 text-right">82.4/100</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-slate-400 text-[10px]">Post-Work:</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[20%]" />
                      </div>
                      <span className="font-mono text-emerald-400 font-bold w-16 text-right">19.5/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Impact data is audited via satellite telemetry & post-completion citizen SMS surveys.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('impact');
                    setActiveOverviewModal(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Explore Full Impact Tab
                </button>
                <button
                  onClick={() => {
                    setActiveTab('projects');
                    setActiveOverviewModal(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Kanban className="w-3.5 h-3.5 text-blue-400" />
                  View Projects Pipeline
                </button>
                <button
                  onClick={() => setActiveOverviewModal(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Granular Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-400 text-sm">{selectedReport.tracking_id}</span>
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-[10px] font-bold uppercase">{selectedReport.status}</span>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">ORIGINAL CITIZEN SUBMISSION ({selectedReport.original_language || 'Vernacular'}):</span>
                <p className="text-white font-medium">{selectedReport.original_text}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-emerald-400 block font-semibold mb-1">AI NORMALIZED SUMMARY:</span>
                <p className="text-slate-200">{selectedReport.translated_summary}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Category</span>
                <span className="font-bold text-white truncate block">{selectedReport.category}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Severity</span>
                <span className="text-lg font-bold text-rose-400">{selectedReport.severity}/10</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Urgency</span>
                <span className="text-lg font-bold text-amber-400">{selectedReport.urgency}/10</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Evidence</span>
                <span className="font-bold text-emerald-400">{selectedReport.evidence_type}</span>
              </div>
            </div>

            {selectedReport.ai_observation && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-blue-300 block">AI Computer Vision Inspection:</span>
                <p className="text-slate-300">Detected: <strong>{selectedReport.ai_observation.detected_issue}</strong> (Confidence: {Math.round((selectedReport.ai_observation.confidence || 0.9) * 100)}%)</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span>📍 {selectedReport.location_name || `${selectedReport.latitude.toFixed(4)}, ${selectedReport.longitude.toFixed(4)}`}</span>
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

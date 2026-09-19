import {
  CitizenReport,
  IssueCluster,
  Project,
  ImpactMeasurement,
  OverviewAnalytics,
  AIAnalysisResult
} from '../types';

const API_BASE = 'http://localhost:8000/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async submitReport(payload: {
    original_text: string;
    original_language?: string;
    latitude: number;
    longitude: number;
    location_name?: string;
    evidence_type?: string;
    evidence_url?: string;
    contact_name?: string;
    contact_phone?: string;
  }): Promise<CitizenReport> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit report');
    return res.json();
  },

  async previewAnalysis(text: string, has_image = false): Promise<AIAnalysisResult> {
    const res = await fetch(`${API_BASE}/reports/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, has_image }),
    });
    if (!res.ok) throw new Error('Failed to preview analysis');
    return res.json();
  },

  async getReports(params?: { category?: string; district?: string; status?: string; search?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.district) query.append('district', params.district);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/reports?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json() as Promise<CitizenReport[]>;
  },

  async trackReportStatus(trackingId: string) {
    const res = await fetch(`${API_BASE}/reports/track/${encodeURIComponent(trackingId.trim())}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Report not found' }));
      throw new Error(err.detail || 'Report not found');
    }
    return res.json();
  },

  getHotspotsCsvUrl() {
    return `${API_BASE}/hotspots/export/csv`;
  },

  async getHotspots(params?: { category?: string; district?: string; priority_level?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.district) query.append('district', params.district);
    if (params?.priority_level) query.append('priority_level', params.priority_level);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE}/hotspots?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch hotspots');
    return res.json() as Promise<IssueCluster[]>;
  },

  async getHotspotDetail(id: string): Promise<IssueCluster> {
    const res = await fetch(`${API_BASE}/hotspots/${id}`);
    if (!res.ok) throw new Error('Failed to fetch hotspot detail');
    return res.json();
  },

  async getPriorityWeights() {
    const res = await fetch(`${API_BASE}/priority/weights`);
    return res.json();
  },

  async updatePriorityWeights(weights: Record<string, number>) {
    const res = await fetch(`${API_BASE}/priority/weights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights),
    });
    return res.json();
  },

  async getRecommendations() {
    const res = await fetch(`${API_BASE}/recommendations`);
    return res.json();
  },

  async getProjects(params?: { status?: string; district?: string }): Promise<Project[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.district) query.append('district', params.district);

    const res = await fetch(`${API_BASE}/projects?${query.toString()}`);
    return res.json();
  },

  async createProject(payload: {
    cluster_id: string;
    title: string;
    description: string;
    district: string;
    target_area: string;
    category: string;
    estimated_budget?: number;
    estimated_beneficiaries?: number;
  }): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async updateProjectStatus(id: string, status: string, note?: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    return res.json();
  },

  async getImpactMeasurements(): Promise<ImpactMeasurement[]> {
    const res = await fetch(`${API_BASE}/impact`);
    return res.json();
  },

  async getOverviewAnalytics(): Promise<OverviewAnalytics> {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    return res.json();
  },

  async getDevelopmentGaps() {
    const res = await fetch(`${API_BASE}/analytics/gaps`);
    return res.json();
  },

  async askAssistant(query: string, district_filter?: string) {
    const res = await fetch(`${API_BASE}/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, district_filter }),
    });
    return res.json();
  },

  async triggerSimulation(count = 5) {
    const res = await fetch(`${API_BASE}/simulation/trigger?count=${count}`, {
      method: 'POST',
    });
    return res.json();
  }
};

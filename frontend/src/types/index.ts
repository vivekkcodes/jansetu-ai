export interface CitizenReport {
  id: string;
  tracking_id: string;
  original_language: string;
  original_text: string;
  translated_summary: string;
  category: string;
  subcategory?: string;
  severity: number;
  urgency: number;
  affected_services: string[];
  latitude: number;
  longitude: number;
  location_name?: string;
  evidence_type: string;
  evidence_url?: string;
  ai_observation?: {
    detected_issue: string;
    confidence: number;
    visual_evidence: string[];
    ai_disclaimer?: string;
  };
  cluster_id?: string;
  status: string;
  contact_name?: string;
  created_at: string;
}

export interface PriorityBreakdown {
  citizen_demand_score: number;
  population_impact_score: number;
  infrastructure_gap_score: number;
  severity_score: number;
  critical_service_score: number;
  urgency_score: number;
  final_score: number;
  formula_version: string;
  weights_snapshot: Record<string, number>;
}

export interface Recommendation {
  id: string;
  cluster_id: string;
  problem_summary: string;
  evidence_summary: string;
  affected_population: number;
  recommended_intervention: string;
  expected_service_impact: string;
  required_verification: string;
  confidence_score: number;
  limitations?: string;
  created_at: string;
}

export interface IssueCluster {
  id: string;
  cluster_code: string;
  category: string;
  subcategory?: string;
  title: string;
  primary_location: string;
  district: string;
  state: string;
  center_lat: number;
  center_lng: number;
  report_count: number;
  estimated_population: number;
  severity_score: number;
  priority_score: number;
  priority_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  affected_services: string[];
  why_prioritized: string[];
  priority_breakdown?: PriorityBreakdown;
  recommendation?: Recommendation;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  project_code: string;
  title: string;
  description: string;
  cluster_id?: string;
  district: string;
  target_area: string;
  category: string;
  estimated_budget: number;
  estimated_beneficiaries: number;
  status: 'Identified' | 'Verified' | 'Proposed' | 'Approved' | 'In Progress' | 'Completed';
  priority_score: number;
  created_at: string;
  updated_at: string;
}

export interface ImpactMeasurement {
  id: string;
  project_id: string;
  cluster_id?: string;
  pre_report_count: number;
  post_report_count: number;
  pre_infra_index: number;
  post_infra_index: number;
  emergency_access_change: string;
  citizen_satisfaction_score: number;
  is_measured: boolean;
  created_at: string;
}

export interface DistrictDistribution {
  district: string;
  state: string;
  reports: number;
  hotspots: number;
  critical_count: number;
  population: number;
  top_category: string;
  cluster_codes: string[];
}

export interface OverviewAnalytics {
  total_reports: number;
  active_hotspots: number;
  critical_issues: number;
  resolved_count: number;
  category_distribution: { name: string; reports: number }[];
  priority_distribution: { level: string; count: number }[];
  timeline_trend: { period: string; reports: number; resolved: number }[];
  districts_covered: string[];
  district_distribution?: DistrictDistribution[];
}

export interface AIAnalysisResult {
  language: string;
  translated_summary: string;
  category: string;
  subcategory: string;
  severity: number;
  urgency: number;
  affected_services: string[];
  location: Record<string, string>;
  evidence_type: string;
  ai_observation?: any;
}

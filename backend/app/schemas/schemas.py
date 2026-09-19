from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class CitizenReportCreate(BaseModel):
    original_text: str = Field(..., min_length=3, description="Citizen's voice transcript or written text")
    original_language: Optional[str] = "Hindi"
    latitude: float
    longitude: float
    location_name: Optional[str] = "Detected Area"
    evidence_type: Optional[str] = "None"
    evidence_url: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None

class AIAnalysisResult(BaseModel):
    language: str
    translated_summary: str
    category: str
    subcategory: str
    severity: int = Field(..., ge=1, le=10)
    urgency: int = Field(..., ge=1, le=10)
    affected_services: List[str]
    location: Dict[str, str] = Field(default_factory=dict)
    evidence_type: str = "Citizen Report"
    ai_observation: Optional[Dict[str, Any]] = None

class CitizenReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    tracking_id: str
    original_language: str
    original_text: str
    translated_summary: str
    category: str
    subcategory: Optional[str]
    severity: int
    urgency: int
    affected_services: List[str]
    latitude: float
    longitude: float
    location_name: Optional[str]
    evidence_type: str
    evidence_url: Optional[str]
    ai_observation: Optional[Dict[str, Any]]
    cluster_id: Optional[str]
    status: str
    contact_name: Optional[str] = None
    created_at: datetime

class PriorityScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    citizen_demand_score: float
    population_impact_score: float
    infrastructure_gap_score: float
    severity_score: float
    critical_service_score: float
    urgency_score: float
    final_score: float
    formula_version: str
    weights_snapshot: Dict[str, float]

class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    cluster_id: str
    problem_summary: str
    evidence_summary: str
    affected_population: int
    recommended_intervention: str
    expected_service_impact: str
    required_verification: str
    confidence_score: float
    limitations: Optional[str]
    created_at: datetime

class IssueClusterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    cluster_code: str
    category: str
    subcategory: Optional[str]
    title: str
    primary_location: str
    district: str
    state: str
    center_lat: float
    center_lng: float
    report_count: int
    estimated_population: int
    severity_score: float
    priority_score: float
    priority_level: str
    status: str
    affected_services: List[str]
    why_prioritized: List[str]
    priority_breakdown: Optional[PriorityScoreResponse] = None
    recommendation: Optional[RecommendationResponse] = None
    created_at: datetime
    updated_at: datetime

class PriorityWeightsUpdate(BaseModel):
    citizen_demand: float = Field(0.30, ge=0.0, le=1.0)
    population_impact: float = Field(0.20, ge=0.0, le=1.0)
    infrastructure_gap: float = Field(0.20, ge=0.0, le=1.0)
    severity: float = Field(0.15, ge=0.0, le=1.0)
    critical_service: float = Field(0.10, ge=0.0, le=1.0)
    urgency: float = Field(0.05, ge=0.0, le=1.0)

class ProjectCreate(BaseModel):
    cluster_id: str
    title: str
    description: str
    district: str
    target_area: str
    category: str
    estimated_budget: Optional[float] = 1500000.0
    estimated_beneficiaries: Optional[int] = 5000

class ProjectUpdate(BaseModel):
    status: Optional[str] = None
    note: Optional[str] = None

class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_code: str
    title: str
    description: str
    cluster_id: Optional[str]
    district: str
    target_area: str
    category: str
    estimated_budget: float
    estimated_beneficiaries: int
    status: str
    priority_score: float
    created_at: datetime
    updated_at: datetime

class ImpactMeasurementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_id: str
    cluster_id: Optional[str]
    pre_report_count: int
    post_report_count: int
    pre_infra_index: float
    post_infra_index: float
    emergency_access_change: str
    citizen_satisfaction_score: float
    is_measured: bool
    created_at: datetime

class AssistantQuery(BaseModel):
    query: str
    district_filter: Optional[str] = None

class AssistantResponse(BaseModel):
    answer: str
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    suggested_actions: List[str] = Field(default_factory=list)
    confidence: float = 0.95

class OverviewAnalyticsResponse(BaseModel):
    total_reports: int
    active_hotspots: int
    critical_issues: int
    resolved_count: int
    category_distribution: List[Dict[str, Any]]
    priority_distribution: List[Dict[str, Any]]
    timeline_trend: List[Dict[str, Any]]
    districts_covered: List[str]

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Location(Base):
    __tablename__ = "locations"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    subdistrict = Column(String(100), nullable=True)
    village_ward = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    pincode = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("CitizenReport", back_populates="location")

class CitizenReport(Base):
    __tablename__ = "citizen_reports"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    tracking_id = Column(String(30), unique=True, index=True, nullable=False)
    original_language = Column(String(20), default="English")
    original_text = Column(Text, nullable=False)
    translated_summary = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    subcategory = Column(String(100), nullable=True)
    severity = Column(Integer, default=5) # 1-10
    urgency = Column(Integer, default=5)  # 1-10
    affected_services = Column(JSON, default=list) # e.g. ['Healthcare', 'Transportation']
    
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    location_name = Column(String(200), nullable=True)
    
    evidence_type = Column(String(30), default="None") # 'Image', 'Audio', 'None'
    evidence_url = Column(String(500), nullable=True)
    ai_observation = Column(JSON, nullable=True) # Visual detection results
    
    cluster_id = Column(String(36), ForeignKey("issue_clusters.id"), nullable=True, index=True)
    status = Column(String(30), default="received", index=True) # 'received', 'clustered', 'investigating', 'actioned', 'resolved'
    contact_name = Column(String(100), nullable=True)
    contact_phone = Column(String(30), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    location = relationship("Location", back_populates="reports")
    cluster = relationship("IssueCluster", back_populates="reports")

class IssueCluster(Base):
    __tablename__ = "issue_clusters"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_code = Column(String(30), unique=True, index=True, nullable=False) # e.g. RD-2048
    category = Column(String(50), nullable=False, index=True)
    subcategory = Column(String(100), nullable=True)
    title = Column(String(250), nullable=False)
    primary_location = Column(String(200), nullable=False)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), default="Uttar Pradesh")
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    report_count = Column(Integer, default=1)
    estimated_population = Column(Integer, default=1000)
    
    severity_score = Column(Float, default=50.0) # 0-100
    priority_score = Column(Float, default=50.0, index=True) # 0-100
    priority_level = Column(String(20), default="MEDIUM", index=True) # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(30), default="Active", index=True) # Active, Under Review, Proposed, In Progress, Resolved
    
    affected_services = Column(JSON, default=list)
    why_prioritized = Column(JSON, default=list) # Explainability badges & rationale
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reports = relationship("CitizenReport", back_populates="cluster")
    priority_breakdown = relationship("PriorityScore", back_populates="cluster", uselist=False)
    recommendation = relationship("Recommendation", back_populates="cluster", uselist=False)
    projects = relationship("Project", back_populates="cluster")

class PriorityScore(Base):
    __tablename__ = "priority_scores"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_id = Column(String(36), ForeignKey("issue_clusters.id"), unique=True, nullable=False)
    citizen_demand_score = Column(Float, default=0.0)
    population_impact_score = Column(Float, default=0.0)
    infrastructure_gap_score = Column(Float, default=0.0)
    severity_score = Column(Float, default=0.0)
    critical_service_score = Column(Float, default=0.0)
    urgency_score = Column(Float, default=0.0)
    final_score = Column(Float, default=0.0)
    formula_version = Column(String(20), default="v1.0")
    weights_snapshot = Column(JSON, default=dict)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cluster = relationship("IssueCluster", back_populates="priority_breakdown")

class PopulationData(Base):
    __tablename__ = "population_data"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    district = Column(String(100), nullable=False, index=True)
    subdistrict = Column(String(100), nullable=True)
    village_name = Column(String(150), nullable=False)
    total_population = Column(Integer, default=5000)
    households = Column(Integer, default=800)
    schools_count = Column(Integer, default=2)
    healthcare_facilities_count = Column(Integer, default=1)
    vulnerable_pct = Column(Float, default=25.0)

class InfrastructureData(Base):
    __tablename__ = "infrastructure_data"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    district = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    existing_infra_index = Column(Float, default=60.0) # 0-100
    access_index = Column(Float, default=55.0)
    reliability_index = Column(Float, default=50.0)
    gap_score = Column(Float, default=40.0) # 100 - existing_infra_index

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_id = Column(String(36), ForeignKey("issue_clusters.id"), unique=True, nullable=False)
    problem_summary = Column(Text, nullable=False)
    evidence_summary = Column(Text, nullable=False)
    affected_population = Column(Integer, default=0)
    recommended_intervention = Column(Text, nullable=False)
    expected_service_impact = Column(Text, nullable=False)
    required_verification = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.88)
    limitations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    cluster = relationship("IssueCluster", back_populates="recommendation")

class Project(Base):
    __tablename__ = "projects"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_code = Column(String(30), unique=True, index=True, nullable=False)
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=False)
    cluster_id = Column(String(36), ForeignKey("issue_clusters.id"), nullable=True)
    district = Column(String(100), nullable=False)
    target_area = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    estimated_budget = Column(Float, default=1500000.0) # In INR
    estimated_beneficiaries = Column(Integer, default=5000)
    status = Column(String(30), default="Identified", index=True) # Identified -> Verified -> Proposed -> Approved -> In Progress -> Completed
    priority_score = Column(Float, default=75.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cluster = relationship("IssueCluster", back_populates="projects")
    updates = relationship("ProjectUpdate", back_populates="project")
    impact = relationship("ImpactMeasurement", back_populates="project", uselist=False)

class ProjectUpdate(Base):
    __tablename__ = "project_updates"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    status_change = Column(String(50), nullable=False)
    note = Column(Text, nullable=False)
    updated_by = Column(String(100), default="District Admin")
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="updates")

class ImpactMeasurement(Base):
    __tablename__ = "impact_measurements"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), unique=True, nullable=False)
    cluster_id = Column(String(36), nullable=True)
    pre_report_count = Column(Integer, default=500)
    post_report_count = Column(Integer, default=65)
    pre_infra_index = Column(Float, default=38.0)
    post_infra_index = Column(Float, default=82.0)
    emergency_access_change = Column(String(100), default="Ambulance transit time reduced by 40%")
    citizen_satisfaction_score = Column(Float, default=88.5)
    is_measured = Column(Boolean, default=True) # True = real/verified measure, False = projected
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="impact")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(36), nullable=True)
    user_role = Column(String(50), default="Admin")
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

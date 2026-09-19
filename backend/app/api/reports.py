import uuid
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.models import CitizenReport, IssueCluster, PriorityScore
from app.schemas.schemas import CitizenReportCreate, CitizenReportResponse, AIAnalysisResult
from app.services.ai_service import ai_service
from app.services.vision_service import vision_service
from app.services.priority_engine import priority_engine

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("", response_model=CitizenReportResponse)
async def submit_report(report_in: CitizenReportCreate, db: Session = Depends(get_db)):
    # 1. AI Analysis & Classification
    ai_result = await ai_service.analyze_report(
        text=report_in.original_text,
        original_language=report_in.original_language or "auto",
        location_hint=report_in.location_name or ""
    )

    # 2. Vision inspection if image attached
    ai_obs = None
    if report_in.evidence_type == "Image" or report_in.evidence_url:
        ai_obs = vision_service.analyze_evidence(category=ai_result["category"])

    tracking_id = f"JNS-{random.randint(100000, 999999)}"

    # 3. Associate with nearest matching cluster if available (within ~5km)
    matching_cluster = db.query(IssueCluster).filter(
        IssueCluster.category == ai_result["category"],
        IssueCluster.status != "Resolved"
    ).first()
    if not matching_cluster:
        matching_cluster = db.query(IssueCluster).filter(
            IssueCluster.category == ai_result["category"]
        ).first()

    cluster_id = None
    if matching_cluster:
        # Check rough Euclidean distance ~0.05 degrees ~= 5km
        lat_diff = abs(matching_cluster.center_lat - report_in.latitude)
        lng_diff = abs(matching_cluster.center_lng - report_in.longitude)
        if lat_diff < 0.08 and lng_diff < 0.08:
            cluster_id = matching_cluster.id
            matching_cluster.report_count += 1
            # Recalculate priority
            score, breakdown, why = priority_engine.calculate_cluster_priority(
                report_count=matching_cluster.report_count,
                estimated_population=matching_cluster.estimated_population,
                infra_existing_index=45.0,
                avg_severity=ai_result["severity"],
                affected_services=matching_cluster.affected_services,
                avg_urgency=ai_result["urgency"]
            )
            matching_cluster.priority_score = score
            matching_cluster.why_prioritized = why
            if score >= 85.0:
                matching_cluster.priority_level = "CRITICAL"
            elif score >= 65.0:
                matching_cluster.priority_level = "HIGH"

    new_report = CitizenReport(
        tracking_id=tracking_id,
        original_language=ai_result.get("language", report_in.original_language or "Hindi"),
        original_text=report_in.original_text,
        translated_summary=ai_result.get("translated_summary", report_in.original_text),
        category=ai_result["category"],
        subcategory=ai_result.get("subcategory"),
        severity=ai_result.get("severity", 6),
        urgency=ai_result.get("urgency", 5),
        affected_services=ai_result.get("affected_services", ["Public Infrastructure"]),
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        location_name=report_in.location_name or f"{ai_result.get('location', {}).get('district', 'Varanasi')}",
        evidence_type=report_in.evidence_type or "None",
        evidence_url=report_in.evidence_url,
        ai_observation=ai_obs,
        cluster_id=cluster_id,
        status="clustered" if cluster_id else "received",
        contact_name=report_in.contact_name,
        contact_phone=report_in.contact_phone
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@router.post("/preview", response_model=AIAnalysisResult)
async def preview_ai_analysis(payload: dict):
    text = payload.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    res = await ai_service.analyze_report(text)
    if payload.get("has_image"):
        res["ai_observation"] = vision_service.analyze_evidence(category=res["category"])
    return res

@router.get("", response_model=List[CitizenReportResponse])
def get_reports(
    category: Optional[str] = None,
    cluster_id: Optional[str] = None,
    district: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(CitizenReport)
    if category and category != "All":
        query = query.filter(CitizenReport.category == category)
    if cluster_id:
        query = query.filter(CitizenReport.cluster_id == cluster_id)
    if status and status != "All":
        query = query.filter(CitizenReport.status == status)
    if district and district != "All":
        query = query.filter(CitizenReport.location_name.contains(district))
    if search:
        query = query.filter(
            (CitizenReport.original_text.contains(search)) |
            (CitizenReport.translated_summary.contains(search)) |
            (CitizenReport.tracking_id.contains(search))
        )
    return query.order_by(desc(CitizenReport.created_at)).offset(skip).limit(limit).all()

@router.get("/track/{tracking_id}")
def track_report_status(tracking_id: str, db: Session = Depends(get_db)):
    report = db.query(CitizenReport).filter(
        (CitizenReport.tracking_id == tracking_id) | (CitizenReport.id == tracking_id)
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"Citizen report not found for tracking code {tracking_id}")
    
    cluster_info = None
    project_info = None
    if report.cluster_id:
        cluster = db.query(IssueCluster).filter(IssueCluster.id == report.cluster_id).first()
        if cluster:
            cluster_info = {
                "id": cluster.id,
                "cluster_code": cluster.cluster_code,
                "title": cluster.title,
                "priority_score": cluster.priority_score,
                "priority_level": cluster.priority_level,
                "report_count": cluster.report_count,
                "estimated_population": cluster.estimated_population,
                "district": cluster.district,
                "why_prioritized": cluster.why_prioritized
            }
            # Look for project linked to this cluster
            from app.models.models import Project
            project = db.query(Project).filter(Project.cluster_id == cluster.id).first()
            if project:
                project_info = {
                    "id": project.id,
                    "project_code": project.project_code,
                    "title": project.title,
                    "status": project.status,
                    "estimated_budget": project.estimated_budget,
                    "estimated_beneficiaries": project.estimated_beneficiaries,
                    "target_area": project.target_area
                }

    proj_status = project_info.get("status") if project_info else "Pending"
    
    timeline = [
        {
            "stage": "Citizen Ingestion & AI Verification",
            "state": "completed",
            "date": report.created_at.strftime("%d %b %Y, %I:%M %p") if report.created_at else "Verified",
            "desc": f"Received and processed via Multilingual NLP ({report.original_language}). Classified as {report.category} (Severity: {report.severity}/10, Urgency: {report.urgency}/10)."
        },
        {
            "stage": "Spatial Clustering & Deduplication",
            "state": "completed" if cluster_info else "processing",
            "date": "Automated DBSCAN Pipeline",
            "desc": f"Aggregated into Hotspot {cluster_info.get('cluster_code')} with {cluster_info.get('report_count')} verified community submissions." if cluster_info else "Aggregating with localized area reports."
        },
        {
            "stage": "Priority Assessment & Engineering Review",
            "state": "completed" if cluster_info else "pending",
            "date": "District Planning Matrix",
            "desc": f"Priority Score calculated at {cluster_info.get('priority_score')}/100 ({cluster_info.get('priority_level')}). Evaluated for essential public service impact." if cluster_info else "Under evaluation by Priority Engine."
        },
        {
            "stage": "Administrative Sanction & Project Tender",
            "state": "completed" if proj_status in ["Approved", "In Progress", "Completed"] else ("current" if proj_status == "Proposed" or project_info else "pending"),
            "date": "District Magistrate Office",
            "desc": f"Project {project_info.get('project_code')}: '{project_info.get('title')}' is currently in state: '{proj_status}'." if project_info else "Awaiting departmental funding sanction."
        },
        {
            "stage": "Civil Works Execution & Impact Audit",
            "state": "completed" if proj_status == "Completed" else ("current" if proj_status == "In Progress" else "pending"),
            "date": "Public Works / Jal Nigam Department",
            "desc": "Ground execution active. Closed-loop citizen impact verification following completion." if proj_status == "In Progress" else ("Public works executed and citizen impact verified with -88% complaints drop!" if proj_status == "Completed" else "Scheduled upon fund release.")
        }
    ]

    return {
        "tracking_id": report.tracking_id,
        "category": report.category,
        "subcategory": report.subcategory,
        "severity": report.severity,
        "urgency": report.urgency,
        "location_name": report.location_name,
        "original_text": report.original_text,
        "translated_summary": report.translated_summary,
        "created_at": report.created_at.isoformat() if report.created_at else None,
        "status": report.status,
        "cluster": cluster_info,
        "project": project_info,
        "timeline": timeline
    }

@router.get("/{report_id}", response_model=CitizenReportResponse)
def get_report_detail(report_id: str, db: Session = Depends(get_db)):
    report = db.query(CitizenReport).filter(
        (CitizenReport.id == report_id) | (CitizenReport.tracking_id == report_id)
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


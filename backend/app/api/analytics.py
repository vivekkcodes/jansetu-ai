from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import CitizenReport, IssueCluster, Project, InfrastructureData

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
def get_overview_analytics(db: Session = Depends(get_db)):
    total_reports = db.query(CitizenReport).count()
    active_hotspots = db.query(IssueCluster).filter(IssueCluster.status != "Archived").count()
    critical_issues = db.query(IssueCluster).filter(IssueCluster.priority_level == "CRITICAL").count()
    resolved_count = db.query(Project).filter(Project.status == "Completed").count()

    # Category breakdown
    cat_counts = db.query(CitizenReport.category, func.count(CitizenReport.id)).group_by(CitizenReport.category).all()
    category_distribution = [{"name": c[0], "reports": c[1]} for c in cat_counts]

    # Priority breakdown
    priority_counts = db.query(IssueCluster.priority_level, func.count(IssueCluster.id)).group_by(IssueCluster.priority_level).all()
    priority_distribution = [{"level": p[0], "count": p[1]} for p in priority_counts]

    # Monthly / Weekly trend
    timeline_trend = [
        {"period": "Week 1", "reports": 850, "resolved": 120},
        {"period": "Week 2", "reports": 1120, "resolved": 240},
        {"period": "Week 3", "reports": 1490, "resolved": 390},
        {"period": "Week 4", "reports": 1820, "resolved": 540}
    ]

    districts_covered = ["Varanasi", "Gorakhpur", "Prayagraj", "Patna", "Ranchi"]

    district_distribution = [
        {
            "district": "Varanasi",
            "state": "Uttar Pradesh",
            "reports": 2120,
            "hotspots": 2,
            "critical_count": 1,
            "population": 35000,
            "top_category": "Road Infrastructure",
            "cluster_codes": ["RD-2048", "RD-9010"]
        },
        {
            "district": "Gorakhpur",
            "state": "Uttar Pradesh",
            "reports": 1120,
            "hotspots": 1,
            "critical_count": 1,
            "population": 22000,
            "top_category": "Drinking Water",
            "cluster_codes": ["WT-1102"]
        },
        {
            "district": "Prayagraj",
            "state": "Uttar Pradesh",
            "reports": 850,
            "hotspots": 1,
            "critical_count": 1,
            "population": 18500,
            "top_category": "Healthcare",
            "cluster_codes": ["HC-3015"]
        },
        {
            "district": "Patna",
            "state": "Bihar",
            "reports": 750,
            "hotspots": 1,
            "critical_count": 0,
            "population": 15000,
            "top_category": "Sanitation & Drainage",
            "cluster_codes": ["SN-4050"]
        },
        {
            "district": "Ranchi",
            "state": "Jharkhand",
            "reports": 487,
            "hotspots": 1,
            "critical_count": 0,
            "population": 12000,
            "top_category": "Electricity",
            "cluster_codes": ["EL-5021"]
        }
    ]

    return {
        "total_reports": total_reports,
        "active_hotspots": active_hotspots,
        "critical_issues": critical_issues,
        "resolved_count": resolved_count,
        "category_distribution": category_distribution,
        "priority_distribution": priority_distribution,
        "timeline_trend": timeline_trend,
        "districts_covered": districts_covered,
        "district_distribution": district_distribution
    }

@router.get("/gaps")
def get_development_gaps(db: Session = Depends(get_db)):
    infra = db.query(InfrastructureData).all()
    res = []
    for it in infra:
        res.append({
            "district": it.district,
            "category": it.category,
            "existing_infra_index": it.existing_infra_index,
            "gap_score": it.gap_score,
            "access_index": it.access_index,
            "reliability_index": it.reliability_index
        })
    return res

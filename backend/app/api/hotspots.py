from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.models import IssueCluster, CitizenReport, PriorityScore, Recommendation
from app.schemas.schemas import IssueClusterResponse
from app.services.priority_engine import priority_engine
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/hotspots", tags=["Hotspots"])

@router.get("", response_model=List[IssueClusterResponse])
def get_hotspots(
    category: Optional[str] = None,
    district: Optional[str] = None,
    priority_level: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(IssueCluster)
    if category and category != "All":
        query = query.filter(IssueCluster.category == category)
    if district and district != "All":
        query = query.filter(IssueCluster.district == district)
    if priority_level and priority_level != "All":
        query = query.filter(IssueCluster.priority_level == priority_level)
    if status and status != "All":
        query = query.filter(IssueCluster.status == status)

    return query.order_by(desc(IssueCluster.priority_score)).all()

@router.get("/export/csv")
def export_hotspots_csv(db: Session = Depends(get_db)):
    from fastapi.responses import Response
    clusters = db.query(IssueCluster).order_by(desc(IssueCluster.priority_score)).all()
    headers = ["Cluster Code", "Title", "District", "Category", "Priority Score", "Priority Level", "Report Count", "Estimated Population", "Center Lat", "Center Lng", "Primary Location", "Status"]
    lines = [",".join(headers)]
    for c in clusters:
        clean_title = f'"{c.title.replace(chr(34), chr(39))}"'
        clean_loc = f'"{c.primary_location.replace(chr(34), chr(39))}"'
        row = [
            c.cluster_code,
            clean_title,
            c.district,
            c.category,
            str(c.priority_score),
            c.priority_level,
            str(c.report_count),
            str(c.estimated_population),
            str(c.center_lat),
            str(c.center_lng),
            clean_loc,
            c.status
        ]
        lines.append(",".join(row))
    csv_content = "\n".join(lines)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=jansetu_hotspots_export.csv"}
    )

@router.get("/{cluster_id}", response_model=IssueClusterResponse)
def get_hotspot_detail(cluster_id: str, db: Session = Depends(get_db)):
    cluster = db.query(IssueCluster).filter(
        (IssueCluster.id == cluster_id) | (IssueCluster.cluster_code == cluster_id)
    ).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Hotspot not found")
    return cluster

@router.post("/{cluster_id}/merge")
def merge_clusters(cluster_id: str, target_cluster_code: str, db: Session = Depends(get_db)):
    source = db.query(IssueCluster).filter(
        (IssueCluster.id == cluster_id) | (IssueCluster.cluster_code == cluster_id)
    ).first()
    target = db.query(IssueCluster).filter(
        (IssueCluster.id == target_cluster_code) | (IssueCluster.cluster_code == target_cluster_code)
    ).first()

    if not source or not target:
        raise HTTPException(status_code=404, detail="One or both clusters not found")

    # Reassign reports
    db.query(CitizenReport).filter(CitizenReport.cluster_id == source.id).update({"cluster_id": target.id})
    target.report_count += source.report_count
    target.estimated_population += int(source.estimated_population * 0.7)
    
    # Recalculate priority
    score, breakdown, why = priority_engine.calculate_cluster_priority(
        report_count=target.report_count,
        estimated_population=target.estimated_population,
        infra_existing_index=40.0,
        avg_severity=8.8,
        affected_services=target.affected_services,
        avg_urgency=8.5
    )
    target.priority_score = score
    target.why_prioritized = why

    source.status = "Merged"
    db.commit()
    return {"message": f"Cluster {source.cluster_code} successfully merged into {target.cluster_code}", "new_score": target.priority_score}

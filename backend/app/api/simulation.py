import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CitizenReport, IssueCluster, PriorityScore
from app.services.ai_service import ai_service
from app.services.priority_engine import priority_engine

router = APIRouter(prefix="/simulation", tags=["Demo Simulation"])

@router.post("/trigger")
async def trigger_simulation_batch(count: int = 5, db: Session = Depends(get_db)):
    """
    Simulates a sudden burst of new citizen reports (e.g. after a cloudburst/rain event).
    Runs AI classification, updates the target cluster, re-calculates priority score in real time.
    """
    cluster = db.query(IssueCluster).filter(IssueCluster.cluster_code == "RD-2048").first()
    if not cluster:
        cluster = db.query(IssueCluster).order_by(IssueCluster.priority_score.desc()).first()
    if not cluster:
        raise HTTPException(status_code=400, detail="No clusters found in database to simulate reports into")

    sample_incoming = [
        "????? ??? ???? ?? ??????? ????? ???? ?? 3 ??? ????? ?? ??? ??, ???? ?? ?? ???? ????? ???",
        "Ambulance stranded at village entrance due to washed out culvert. Emergency!",
        "Severe water accumulation near Harahua primary school. Road completely broken.",
        "???? ?? ???? ?????? ??? ??? ??, ??? ?? ??? ????? ???? ???? ???? ?? ??? ???",
        "Two students fell off motorcycle into deep pothole on Cholapur road. Immediate intervention needed!"
    ]

    new_reports_created = []
    for i in range(min(count, len(sample_incoming))):
        text = sample_incoming[i]
        ai_res = await ai_service.analyze_report(text)
        
        rep = CitizenReport(
            tracking_id=f"JNS-LIVE-{random.randint(10000, 99999)}",
            original_language=ai_res.get("language", "Hindi"),
            original_text=text,
            translated_summary=ai_res.get("translated_summary", text),
            category=cluster.category,
            subcategory=cluster.subcategory,
            severity=9,
            urgency=10,
            affected_services=["Healthcare", "Transportation"],
            latitude=cluster.center_lat + random.uniform(-0.008, 0.008),
            longitude=cluster.center_lng + random.uniform(-0.008, 0.008),
            location_name=cluster.primary_location,
            evidence_type="Image" if (i % 2 == 0) else "None",
            cluster_id=cluster.id,
            status="clustered"
        )
        db.add(rep)
        new_reports_created.append({
            "tracking_id": rep.tracking_id,
            "text": text,
            "category": rep.category,
            "urgency": rep.urgency
        })

    cluster.report_count += len(new_reports_created)
    old_score = cluster.priority_score

    new_score, breakdown, why = priority_engine.calculate_cluster_priority(
        report_count=cluster.report_count,
        estimated_population=cluster.estimated_population,
        infra_existing_index=40.0,
        avg_severity=9.2,
        affected_services=cluster.affected_services,
        avg_urgency=9.5
    )
    cluster.priority_score = new_score
    cluster.why_prioritized = why
    
    pb = cluster.priority_breakdown
    if pb:
        pb.citizen_demand_score = breakdown["citizen_demand_score"]
        pb.urgency_score = breakdown["urgency_score"]
        pb.final_score = new_score

    db.commit()

    return {
        "status": "success",
        "is_simulation": True,
        "message": f"Successfully ingested {len(new_reports_created)} live citizen reports and updated Hotspot {cluster.cluster_code}",
        "affected_cluster": {
            "cluster_code": cluster.cluster_code,
            "title": cluster.title,
            "new_report_count": cluster.report_count,
            "old_priority_score": old_score,
            "new_priority_score": cluster.priority_score,
            "score_delta": round(cluster.priority_score - old_score, 2)
        },
        "ingested_reports": new_reports_created
    }

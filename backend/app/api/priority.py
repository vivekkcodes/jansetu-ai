from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import IssueCluster, PriorityScore
from app.schemas.schemas import PriorityWeightsUpdate
from app.services.priority_engine import priority_engine

router = APIRouter(prefix="/priority", tags=["Priority Engine"])

@router.get("/weights")
def get_weights():
    return {
        "weights": priority_engine.get_weights(),
        "model_badge": "Prototype Prioritization Model (Configurable)"
    }

@router.post("/weights")
def update_weights(weights_in: PriorityWeightsUpdate, db: Session = Depends(get_db)):
    new_weights = weights_in.model_dump()
    normalized = priority_engine.update_weights(new_weights)

    clusters = db.query(IssueCluster).all()
    for c in clusters:
        pb = c.priority_breakdown
        if pb:
            w = normalized
            new_score = (
                w["citizen_demand"] * pb.citizen_demand_score +
                w["population_impact"] * pb.population_impact_score +
                w["infrastructure_gap"] * pb.infrastructure_gap_score +
                w["severity"] * pb.severity_score +
                w["critical_service"] * pb.critical_service_score +
                w["urgency"] * pb.urgency_score
            )
            c.priority_score = round(min(100.0, max(0.0, new_score)), 1)
            pb.final_score = c.priority_score
            pb.weights_snapshot = normalized
            if c.priority_score >= 85.0:
                c.priority_level = "CRITICAL"
            elif c.priority_score >= 65.0:
                c.priority_level = "HIGH"
            elif c.priority_score >= 45.0:
                c.priority_level = "MEDIUM"
            else:
                c.priority_level = "LOW"

    db.commit()
    return {
        "message": "Weights updated and cluster priorities recalculated successfully",
        "active_weights": normalized,
        "clusters_updated": len(clusters)
    }

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Recommendation, IssueCluster
from app.schemas.schemas import RecommendationResponse
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationResponse])
def get_all_recommendations(db: Session = Depends(get_db)):
    return db.query(Recommendation).all()

@router.post("/{cluster_id}/generate", response_model=RecommendationResponse)
def generate_for_cluster(cluster_id: str, db: Session = Depends(get_db)):
    cluster = db.query(IssueCluster).filter(
        (IssueCluster.id == cluster_id) | (IssueCluster.cluster_code == cluster_id)
    ).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")

    rec_data = recommendation_service.generate_recommendation(
        cluster_code=cluster.cluster_code,
        category=cluster.category,
        title=cluster.title,
        primary_location=cluster.primary_location,
        district=cluster.district,
        report_count=cluster.report_count,
        estimated_population=cluster.estimated_population,
        priority_score=cluster.priority_score,
        affected_services=cluster.affected_services
    )

    rec = db.query(Recommendation).filter(Recommendation.cluster_id == cluster.id).first()
    if rec:
        for k, v in rec_data.items():
            setattr(rec, k, v)
    else:
        rec = Recommendation(cluster_id=cluster.id, **rec_data)
        db.add(rec)

    db.commit()
    db.refresh(rec)
    return rec

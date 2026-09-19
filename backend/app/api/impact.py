from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import ImpactMeasurement
from app.schemas.schemas import ImpactMeasurementResponse

router = APIRouter(prefix="/impact", tags=["Impact Analytics"])

@router.get("", response_model=List[ImpactMeasurementResponse])
def get_impact_records(db: Session = Depends(get_db)):
    return db.query(ImpactMeasurement).all()

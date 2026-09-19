from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import AssistantQuery, AssistantResponse
from app.services.assistant_service import assistant_service

router = APIRouter(prefix="/assistant", tags=["JanSetu AI Assistant"])

@router.post("", response_model=AssistantResponse)
def query_assistant(payload: AssistantQuery, db: Session = Depends(get_db)):
    result = assistant_service.answer_query(
        db=db,
        query=payload.query,
        district_filter=payload.district_filter
    )
    return result

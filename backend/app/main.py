from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api import (
    reports,
    hotspots,
    priority,
    recommendations,
    projects,
    impact,
    assistant,
    simulation,
    analytics
)

# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JanSetu AI API",
    version="1.0.0",
    description="Development Intelligence and Priority Engine - From Citizen Voice to Development Priority"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api
app.include_router(reports.router, prefix=settings.API_PREFIX)
app.include_router(hotspots.router, prefix=settings.API_PREFIX)
app.include_router(priority.router, prefix=settings.API_PREFIX)
app.include_router(recommendations.router, prefix=settings.API_PREFIX)
app.include_router(projects.router, prefix=settings.API_PREFIX)
app.include_router(impact.router, prefix=settings.API_PREFIX)
app.include_router(assistant.router, prefix=settings.API_PREFIX)
app.include_router(simulation.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "JanSetu AI Engine",
        "version": "1.0.0",
        "ai_provider": settings.AI_PROVIDER
    }

import os
from typing import Dict, Any

# Resolve absolute path to project root
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# backend/app/core -> backend -> jansetu-ai
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", ".."))
DEFAULT_DB_PATH = os.path.join(PROJECT_ROOT, "jansetu.db").replace("\\", "/")

class Settings:
    PROJECT_NAME: str = "JanSetu AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    DEFAULT_WEIGHTS: Dict[str, float] = {
        "citizen_demand": 0.30,
        "population_impact": 0.20,
        "infrastructure_gap": 0.20,
        "severity": 0.15,
        "critical_service": 0.10,
        "urgency": 0.05
    }
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

settings = Settings()

import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend and root paths
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.main import app
from data.seed_generator import seed_database

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_seed():
    seed_database()

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "JanSetu AI Engine"

def test_hotspots_list():
    response = client.get("/api/hotspots")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    rd_2048 = next((h for h in data if h["cluster_code"] == "RD-2048"), None)
    assert rd_2048 is not None
    assert rd_2048["category"] == "Road Infrastructure"
    assert rd_2048["report_count"] >= 647
    assert rd_2048["priority_score"] >= 88.0
    assert "Healthcare" in rd_2048["affected_services"]

def test_analytics_overview():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["total_reports"] >= 5000
    assert data["active_hotspots"] >= 4
    assert len(data["category_distribution"]) > 0

def test_report_submission_hindi():
    payload = {
        "original_text": "हमारे गांव की सड़क बारिश में पूरी तरह खराब हो जाती है और एम्बुलेंस नहीं पहुंच पाती।",
        "original_language": "Hindi",
        "latitude": 25.3850,
        "longitude": 83.0210,
        "location_name": "Cholapur-Harahua Rural Corridor",
        "evidence_type": "Image"
    }
    response = client.post("/api/reports", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Road Infrastructure"
    assert data["severity"] >= 8
    assert "Healthcare" in data["affected_services"]
    assert data["tracking_id"].startswith("JNS-")

def test_assistant_query():
    res1 = client.post("/api/assistant", json={
        "query": "Which development issue should the district administration investigate first?"
    })
    assert res1.status_code == 200
    ans1 = res1.json()["answer"]
    assert "RD-2048" in ans1 or "investigate" in ans1

    res2 = client.post("/api/assistant", json={
        "query": "Why is RD-2048 high priority?"
    })
    assert res2.status_code == 200
    ans2 = res2.json()["answer"]
    assert "RD-2048" in ans2
    assert "Citizen Demand" in ans2

def test_project_lifecycle():
    create_payload = {
        "cluster_id": "WT-1102",
        "title": "Emergency Pipeline Rehabilitation Pipraich",
        "description": "Pipe replacement for contaminated wards.",
        "district": "Gorakhpur",
        "target_area": "Pipraich",
        "category": "Drinking Water",
        "estimated_budget": 2000000.0,
        "estimated_beneficiaries": 6150
    }
    res_proj = client.post("/api/projects", json=create_payload)
    assert res_proj.status_code == 200
    proj = res_proj.json()
    proj_id = proj["id"]
    assert proj["status"] == "Proposed"

    res_patch = client.patch(f"/api/projects/{proj_id}", json={
        "status": "Completed",
        "note": "Civil construction completed on schedule"
    })
    assert res_patch.status_code == 200
    assert res_patch.json()["status"] == "Completed"

def test_simulation():
    res = client.post("/api/simulation/trigger?count=3")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["is_simulation"] is True
    assert len(data["ingested_reports"]) == 3

def test_priority_weights():
    res_get = client.get("/api/priority/weights")
    assert res_get.status_code == 200
    weights = res_get.json()["weights"]
    assert "citizen_demand" in weights
    assert "infrastructure_gap" in weights

    res_post = client.post("/api/priority/weights", json={
        "citizen_demand": 0.35,
        "population_impact": 0.20,
        "infrastructure_gap": 0.20,
        "severity": 0.15,
        "critical_service": 0.05,
        "urgency": 0.05
    })
    assert res_post.status_code == 200
    assert res_post.json()["clusters_updated"] >= 5
